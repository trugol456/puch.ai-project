import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import { createStorageAdapter } from '@/lib/storage-adapters';

interface ExportRequestBody {
  html: string;
  title?: string;
}

const PDF_STYLES = `
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  h1 { font-size: 24px; margin-bottom: 10px; color: #2c3e50; }
  h2 { font-size: 18px; margin-top: 20px; margin-bottom: 8px; color: #34495e; border-bottom: 1px solid #eee; }
  h3 { font-size: 16px; margin-top: 15px; margin-bottom: 5px; color: #34495e; }
  ul { margin: 10px 0; padding-left: 20px; }
  li { margin-bottom: 4px; }
  .section { margin-bottom: 20px; }
  .summary { font-style: italic; margin-bottom: 15px; }
  .cover-letter { margin-top: 30px; }
  @media print {
    body { margin: 0; padding: 15px; }
    .page-break { page-break-before: always; }
  }
</style>
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let browser: puppeteer.Browser | null = null;

  try {
    const { html, title }: ExportRequestBody = req.body;

    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // TODO: Add production hardening for Puppeteer
    // Launch Puppeteer with safe options
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Use only in development
      ],
    });

    const page = await browser.newPage();

    // Create complete HTML document
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title || 'Resume'}</title>
  ${PDF_STYLES}
</head>
<body>
  ${html}
</body>
</html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();
    browser = null;

    // Upload PDF to storage
    const pdfId = uuidv4();
    const storagePath = `${pdfId}.pdf`;
    
    const storageAdapter = createStorageAdapter();
    await storageAdapter.uploadFile('exports', storagePath, pdfBuffer, 'application/pdf');
    
    // Get signed URL for download
    const signedUrl = await storageAdapter.getSignedUrl('exports', storagePath, 3600);

    console.log('PDF exported successfully');

    res.status(200).json({
      url: signedUrl,
      filename: `${title || 'resume'}.pdf`,
    });
  } catch (error: any) {
    console.error('Export error:', error);
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    res.status(500).json({ 
      error: error.message || 'Failed to export PDF' 
    });
  }
}