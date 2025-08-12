import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

interface PDFOptions {
  html: string;
  title?: string;
  outputPath?: string;
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

const DEFAULT_STYLES = `
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
  h4 { font-size: 14px; margin-top: 12px; margin-bottom: 4px; color: #34495e; }
  ul { margin: 10px 0; padding-left: 20px; }
  li { margin-bottom: 4px; }
  .section { margin-bottom: 20px; }
  .summary { font-style: italic; margin-bottom: 15px; }
  .job { margin-bottom: 15px; }
  .cover-letter { margin-top: 30px; }
  @media print {
    body { margin: 0; padding: 15px; }
    .page-break { page-break-before: always; }
  }
</style>
`;

export async function generatePDF(options: PDFOptions): Promise<Buffer> {
  let browser: puppeteer.Browser | null = null;

  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        ...(process.env.NODE_ENV === 'development' ? ['--single-process'] : []),
      ],
    });

    const page = await browser.newPage();

    // Create complete HTML document
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${options.title || 'Document'}</title>
  ${DEFAULT_STYLES}
</head>
<body>
  ${options.html}
</body>
</html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
        ...options.margin,
      },
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    throw error;
  }
}

// CLI usage example
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run pdf <html-file> [output-file]');
    console.log('Example: npm run pdf sample.html output.pdf');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace(/\.(html|htm)$/i, '.pdf');

  try {
    console.log('📄 Reading HTML file:', inputFile);
    const html = await fs.readFile(inputFile, 'utf-8');
    
    console.log('🖨️  Generating PDF...');
    const pdfBuffer = await generatePDF({
      html,
      title: path.basename(inputFile, path.extname(inputFile)),
    });

    console.log('💾 Writing PDF file:', outputFile);
    await fs.writeFile(outputFile, pdfBuffer);
    
    console.log('✅ PDF generated successfully!');
    console.log(`   Input: ${inputFile}`);
    console.log(`   Output: ${outputFile}`);
    console.log(`   Size: ${Math.round(pdfBuffer.length / 1024)} KB`);
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}