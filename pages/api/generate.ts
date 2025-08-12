import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { generateCompletion } from '@/lib/gemini';
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

    // Generate tailored resume
    const resumePrompt = buildResumePrompt(resumeData, jobData);
    const tailoredResumeHtml = await generateCompletion(resumePrompt, {
      maxTokens: 2048,
      temperature: 0.7,
    });

    // Generate cover letter
    const coverLetterPrompt = buildCoverLetterPrompt(resumeData, jobData);
    const coverLetterHtml = await generateCompletion(coverLetterPrompt, {
      maxTokens: 1024,
      temperature: 0.8,
    });

    // Create summary
    const summary = `Generated tailored resume${jobData.title ? ` for ${jobData.title}` : ''}${jobData.company ? ` at ${jobData.company}` : ''}`;

    console.log('Content generated successfully');

    res.status(200).json({
      tailoredResumeHtml,
      coverLetterHtml,
      summary,
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate content' 
    });
  }
}