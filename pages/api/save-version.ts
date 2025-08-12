import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';
import { generateCompletion } from '@/lib/gemini';
import { buildRedactionPrompt } from '@/lib/prompts';

interface SaveVersionRequestBody {
  title: string;
  resumeHtml: string;
  coverHtml: string;
  fileId?: string;
  jobId?: string;
  isPublic?: boolean;
}

function generatePublicToken(): string {
  // Generate a short, URL-friendly token
  return Math.random().toString(36).substring(2, 12);
}

async function redactSensitiveInfo(html: string): Promise<string> {
  try {
    const redactionPrompt = buildRedactionPrompt(html);
    const redactedHtml = await generateCompletion(redactionPrompt, {
      maxTokens: 2048,
      temperature: 0.1, // Low temperature for consistent redaction
    });
    return redactedHtml;
  } catch (error) {
    console.error('Redaction error:', error);
    // Fallback: simple regex-based redaction
    return html
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email protected]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[phone number]')
      .replace(/\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/g, '[phone number]');
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      title, 
      resumeHtml, 
      coverHtml, 
      fileId, 
      jobId, 
      isPublic = true 
    }: SaveVersionRequestBody = req.body;

    if (!title || !resumeHtml || !coverHtml) {
      return res.status(400).json({ 
        error: 'Title, resumeHtml, and coverHtml are required' 
      });
    }

    // Generate version ID and public token
    const versionId = uuidv4();
    const publicToken = generatePublicToken();

    // Redact sensitive information if making public
    let resumeHtmlRedacted = resumeHtml;
    let coverHtmlRedacted = coverHtml;

    if (isPublic) {
      try {
        resumeHtmlRedacted = await redactSensitiveInfo(resumeHtml);
        coverHtmlRedacted = await redactSensitiveInfo(coverHtml);
      } catch (error) {
        console.error('Failed to redact sensitive info:', error);
        // Continue with original content but log the issue
      }
    }

    // Save version to database
    const { data: version, error: dbError } = await supabaseAdmin
      .from('versions')
      .insert({
        id: versionId,
        file_id: fileId,
        job_id: jobId,
        title,
        resume_html: resumeHtml,
        resume_html_redacted: resumeHtmlRedacted,
        cover_html: coverHtml,
        cover_html_redacted: coverHtmlRedacted,
        public_token: publicToken,
        views: 0,
        is_public: isPublic,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save version');
    }

    console.log(`Version saved successfully: ${title} (${publicToken})`);

    res.status(200).json({
      versionId,
      publicToken,
      title,
      isPublic,
    });
  } catch (error: any) {
    console.error('Save version error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to save version' 
    });
  }
}