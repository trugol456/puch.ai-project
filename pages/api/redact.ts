import { NextApiRequest, NextApiResponse } from 'next';
import { generateCompletion } from '@/lib/gemini';
import { buildRedactionPrompt } from '@/lib/prompts';

interface RedactRequestBody {
  html: string;
  options?: {
    redactEmails?: boolean;
    redactPhones?: boolean;
    redactAddresses?: boolean;
  };
}

function simpleRedaction(html: string, options: any = {}): string {
  let redacted = html;
  
  if (options.redactEmails !== false) {
    // Redact email addresses
    redacted = redacted.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 
      '[email protected]'
    );
  }
  
  if (options.redactPhones !== false) {
    // Redact phone numbers (various formats)
    redacted = redacted
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[phone number]')
      .replace(/\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/g, '[phone number]')
      .replace(/\b\+\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[phone number]');
  }
  
  if (options.redactAddresses) {
    // Basic address redaction (very simple heuristic)
    redacted = redacted.replace(
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi,
      '[address]'
    );
  }
  
  return redacted;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { html, options = {} }: RedactRequestBody = req.body;

    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    let redactedHtml: string;

    try {
      // Try AI-powered redaction first
      const redactionPrompt = buildRedactionPrompt(html);
      redactedHtml = await generateCompletion(redactionPrompt, {
        maxTokens: 2048,
        temperature: 0.1, // Low temperature for consistent results
      });
      
      console.log('AI redaction completed successfully');
    } catch (error) {
      console.warn('AI redaction failed, falling back to regex:', error);
      // Fallback to simple regex-based redaction
      redactedHtml = simpleRedaction(html, options);
    }

    res.status(200).json({
      redactedHtml,
      method: redactedHtml === simpleRedaction(html, options) ? 'regex' : 'ai',
    });
  } catch (error: any) {
    console.error('Redaction error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to redact content' 
    });
  }
}