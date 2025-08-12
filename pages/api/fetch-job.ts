import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';

interface JobRequestBody {
  jobUrl?: string;
  jobText?: string;
}

async function fetchJobFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ResumeBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Simple HTML to text conversion
    // TODO: Use a proper HTML parser like cheerio for better extraction
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!textContent || textContent.length < 100) {
      throw new Error('Could not extract meaningful content from URL');
    }

    return textContent;
  } catch (error: any) {
    console.error('URL fetch error:', error);
    throw new Error(`Failed to fetch job posting: ${error.message}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jobUrl, jobText }: JobRequestBody = req.body;

    if (!jobUrl && !jobText) {
      return res.status(400).json({ 
        error: 'Either jobUrl or jobText must be provided' 
      });
    }

    let content: string;
    let url: string | undefined;
    let title: string | undefined;
    let company: string | undefined;

    if (jobText) {
      content = jobText.trim();
      if (content.length < 10) {
        return res.status(400).json({ 
          error: 'Job text is too short' 
        });
      }
    } else if (jobUrl) {
      content = await fetchJobFromUrl(jobUrl);
      url = jobUrl;
      
      // Basic extraction of title and company (very simple heuristics)
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        title = lines[0].substring(0, 100);
      }
    } else {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Generate job ID
    const jobId = uuidv4();

    // Save job to database
    const { data: jobRecord, error: dbError } = await supabaseAdmin
      .from('jobs')
      .insert({
        id: jobId,
        title,
        company,
        url,
        content,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save job posting');
    }

    const contentPreview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
    console.log(`Job saved successfully: ${title || 'Untitled'} (${contentPreview})`);

    res.status(200).json({
      jobId,
      title,
      company,
      url,
      contentPreview,
    });
  } catch (error: any) {
    console.error('Fetch job error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch job posting' 
    });
  }
}