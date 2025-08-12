import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { generateCompletion, mockGenerateCompletion } from '@/lib/gemini';
import { 
  buildResumePrompt, 
  buildCoverLetterPrompt, 
  validateResumeData, 
  validateJobData 
} from '@/lib/prompts';

interface GenerateRequestBody {
  fileId?: string;
  resumeText?: string;
  jobId?: string;
  jobText?: string;
}

async function generateWithFallback(prompt: string, options: any = {}): Promise<string> {
  try {
    // Try the real Gemini API first
    return await generateCompletion(prompt, options);
  } catch (error: any) {
    console.warn('Gemini API failed, using mock generation:', error.message);
    
    // Fallback to mock generation for development/demo
    if (process.env.NODE_ENV === 'development') {
      return await mockGenerateCompletion(prompt, options);
    }
    
    // In production, still throw the error
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileId, resumeText, jobId, jobText }: GenerateRequestBody = req.body;

    // Validate input
    if (!fileId && !resumeText) {
      return res.status(400).json({ 
        error: 'Either fileId or resumeText must be provided' 
      });
    }

    if (!jobId && !jobText) {
      return res.status(400).json({ 
        error: 'Either jobId or jobText must be provided' 
      });
    }

    // Get resume data
    let resumeData: any;
    if (fileId) {
      const { data: file, error: fileError } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fileError || !file) {
        return res.status(404).json({ error: 'File not found' });
      }

      resumeData = validateResumeData({
        fullText: file.text_content,
      });
    } else {
      resumeData = validateResumeData({
        fullText: resumeText,
      });
    }

    // Get job data
    let jobData: any;
    if (jobId) {
      const { data: job, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      jobData = validateJobData({
        title: job.title,
        company: job.company,
        fullText: job.content,
      });
    } else {
      jobData = validateJobData({
        fullText: jobText,
      });
    }

    // Log truncated versions for debugging
    const resumePreview = resumeData.fullText.substring(0, 200);
    const jobPreview = jobData.fullText.substring(0, 200);
    console.log(`Generating content for resume: ${resumePreview}... and job: ${jobPreview}...`);

    // Check if API key is configured
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    if (!hasApiKey && process.env.NODE_ENV !== 'development') {
      return res.status(500).json({ 
        error: 'Gemini API not configured. Please set GEMINI_API_KEY environment variable.' 
      });
    }

    let tailoredResumeHtml: string;
    let coverLetterHtml: string;

    try {
      // Generate tailored resume
      const resumePrompt = buildResumePrompt(resumeData, jobData);
      tailoredResumeHtml = await generateWithFallback(resumePrompt, {
        maxTokens: 2048,
        temperature: 0.7,
      });

      // Generate cover letter
      const coverLetterPrompt = buildCoverLetterPrompt(resumeData, jobData);
      coverLetterHtml = await generateWithFallback(coverLetterPrompt, {
        maxTokens: 1024,
        temperature: 0.8,
      });
    } catch (error: any) {
      console.error('Content generation failed:', error);
      
      // Provide helpful error messages
      if (error.message.includes('API key')) {
        return res.status(400).json({ 
          error: 'Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable. Get a key from https://makersuite.google.com/app/apikey' 
        });
      } else if (error.message.includes('quota')) {
        return res.status(429).json({ 
          error: 'API quota exceeded. Please try again later or check your Gemini API usage limits.' 
        });
      } else if (error.message.includes('safety')) {
        return res.status(400).json({ 
          error: 'Content generation was blocked by safety filters. Please try with different content.' 
        });
      } else {
        return res.status(500).json({ 
          error: `Content generation failed: ${error.message}` 
        });
      }
    }

    // Create summary
    const summary = `Generated tailored resume${jobData.title ? ` for ${jobData.title}` : ''}${jobData.company ? ` at ${jobData.company}` : ''}`;

    console.log('Content generated successfully');

    res.status(200).json({
      tailoredResumeHtml,
      coverLetterHtml,
      summary,
      usedFallback: !hasApiKey || process.env.NODE_ENV === 'development',
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate content' 
    });
  }
}