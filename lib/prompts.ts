export interface ResumeData {
  name?: string;
  contact?: string;
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
  fullText: string;
}

export interface JobData {
  title?: string;
  company?: string;
  requirements?: string;
  description?: string;
  fullText: string;
}

export function buildResumePrompt(resume: ResumeData, job: JobData): string {
  return `You are an expert resume writer and ATS optimization specialist. Your task is to tailor a resume for a specific job posting while maintaining 100% accuracy of existing information.

CRITICAL RULES:
1. NEVER invent, add, or fabricate any dates, company names, job titles, or personal information
2. ONLY use information that already exists in the original resume
3. Optimize keyword matching with the job posting
4. Convert prose paragraphs to concise bullet points where appropriate
5. Emphasize relevant experience and skills that match the job requirements
6. Output clean HTML that renders well in browsers and is ATS-friendly

ORIGINAL RESUME:
${resume.fullText}

JOB POSTING:
${job.fullText}

TASK:
Tailor the resume above for this specific job posting. Focus on:
- Highlighting relevant keywords from the job posting
- Reordering sections to emphasize the most relevant experience first
- Converting descriptions to bullet points with action verbs
- Ensuring ATS compatibility with proper HTML structure

OUTPUT FORMAT:
Return clean HTML with semantic structure:
- Use <h1> for name, <h2> for section headers, <h3> for job titles
- Use <ul> and <li> for lists and achievements
- Include contact information if present in original
- Use <div class="section"> for major sections
- Include <div class="summary"> for professional summary if applicable

OUTPUT ONLY THE HTML, NO EXPLANATIONS:`;
}

export function buildCoverLetterPrompt(resume: ResumeData, job: JobData): string {
  return `You are an expert cover letter writer. Create a compelling, personalized cover letter that connects the candidate's background to the specific job opportunity.

CRITICAL RULES:
1. NEVER invent personal details, company names, or specific experiences not in the resume
2. Use only information that exists in the provided resume
3. Match the tone to the job posting and company culture
4. Keep it concise (3-4 paragraphs maximum)
5. Include specific keywords from the job posting
6. End with a strong call to action

CANDIDATE RESUME:
${resume.fullText}

JOB POSTING:
${job.fullText}

TASK:
Write a compelling cover letter that:
- Opens with enthusiasm for the specific role and company
- Highlights 2-3 most relevant experiences/skills from the resume
- Connects candidate's background to job requirements
- Shows genuine interest in the company/role
- Closes with next steps

OUTPUT FORMAT:
Return clean HTML formatted cover letter:
- Use <div class="cover-letter"> wrapper
- Use <p> tags for paragraphs
- Include proper salutation and closing
- Use <strong> for emphasis sparingly

OUTPUT ONLY THE HTML, NO EXPLANATIONS:`;
}

export function buildRedactionPrompt(html: string): string {
  return `Remove all email addresses and phone numbers from the following HTML content. Replace them with placeholder text.

RULES:
1. Replace email addresses with "[email protected]"
2. Replace phone numbers with "[phone number]" 
3. Preserve all HTML structure and formatting
4. Do not modify any other content

HTML CONTENT:
${html}

OUTPUT ONLY THE MODIFIED HTML:`;
}

// Validation helpers
export function validateResumeData(data: any): ResumeData {
  return {
    name: data.name || '',
    contact: data.contact || '',
    summary: data.summary || '',
    experience: data.experience || '',
    education: data.education || '',
    skills: data.skills || '',
    fullText: data.fullText || data.toString(),
  };
}

export function validateJobData(data: any): JobData {
  return {
    title: data.title || '',
    company: data.company || '',
    requirements: data.requirements || '',
    description: data.description || '',
    fullText: data.fullText || data.toString(),
  };
}