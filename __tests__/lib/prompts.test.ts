import {
  buildResumePrompt,
  buildCoverLetterPrompt,
  buildRedactionPrompt,
  validateResumeData,
  validateJobData,
} from '../../lib/prompts';

describe('Prompt Templates', () => {
  const sampleResumeData = {
    name: 'John Doe',
    contact: 'john@example.com',
    summary: 'Experienced software engineer',
    experience: 'Software Engineer at ABC Corp',
    education: 'BS Computer Science',
    skills: 'JavaScript, React, Node.js',
    fullText: 'John Doe\nSoftware Engineer\njohn@example.com\nExperienced in web development...',
  };

  const sampleJobData = {
    title: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    requirements: 'React, Node.js, 5+ years experience',
    description: 'Build scalable web applications',
    fullText: 'Senior Software Engineer at TechCorp Inc.\nRequirements: React, Node.js...',
  };

  describe('buildResumePrompt', () => {
    it('should generate a complete resume prompt', () => {
      const prompt = buildResumePrompt(sampleResumeData, sampleJobData);

      expect(prompt).toContain('expert resume writer');
      expect(prompt).toContain('ATS optimization specialist');
      expect(prompt).toContain('NEVER invent, add, or fabricate');
      expect(prompt).toContain(sampleResumeData.fullText);
      expect(prompt).toContain(sampleJobData.fullText);
      expect(prompt).toContain('HTML');
    });

    it('should include critical rules about accuracy', () => {
      const prompt = buildResumePrompt(sampleResumeData, sampleJobData);

      expect(prompt).toContain('CRITICAL RULES:');
      expect(prompt).toContain('NEVER invent');
      expect(prompt).toContain('ONLY use information that already exists');
      expect(prompt).toContain('do not invent dates/names');
    });

    it('should specify HTML output format', () => {
      const prompt = buildResumePrompt(sampleResumeData, sampleJobData);

      expect(prompt).toContain('<h1>');
      expect(prompt).toContain('<h2>');
      expect(prompt).toContain('<ul>');
      expect(prompt).toContain('<li>');
      expect(prompt).toContain('OUTPUT ONLY THE HTML');
    });
  });

  describe('buildCoverLetterPrompt', () => {
    it('should generate a complete cover letter prompt', () => {
      const prompt = buildCoverLetterPrompt(sampleResumeData, sampleJobData);

      expect(prompt).toContain('expert cover letter writer');
      expect(prompt).toContain('compelling, personalized cover letter');
      expect(prompt).toContain('NEVER invent personal details');
      expect(prompt).toContain(sampleResumeData.fullText);
      expect(prompt).toContain(sampleJobData.fullText);
    });

    it('should include specific structure requirements', () => {
      const prompt = buildCoverLetterPrompt(sampleResumeData, sampleJobData);

      expect(prompt).toContain('3-4 paragraphs maximum');
      expect(prompt).toContain('call to action');
      expect(prompt).toContain('<div class="cover-letter">');
      expect(prompt).toContain('<p>');
    });

    it('should emphasize using only existing information', () => {
      const prompt = buildCoverLetterPrompt(sampleResumeData, sampleJobData);

      expect(prompt).toContain('NEVER invent personal details');
      expect(prompt).toContain('Use only information that exists');
      expect(prompt).toContain('not in the resume');
    });
  });

  describe('buildRedactionPrompt', () => {
    it('should generate redaction instructions', () => {
      const htmlContent = '<p>Contact: john@example.com, (555) 123-4567</p>';
      const prompt = buildRedactionPrompt(htmlContent);

      expect(prompt).toContain('Remove all email addresses');
      expect(prompt).toContain('phone numbers');
      expect(prompt).toContain('[email protected]');
      expect(prompt).toContain('[phone number]');
      expect(prompt).toContain(htmlContent);
    });

    it('should preserve HTML structure', () => {
      const htmlContent = '<div><p>Test content</p></div>';
      const prompt = buildRedactionPrompt(htmlContent);

      expect(prompt).toContain('Preserve all HTML structure');
      expect(prompt).toContain('Do not modify any other content');
      expect(prompt).toContain('OUTPUT ONLY THE MODIFIED HTML');
    });
  });

  describe('validateResumeData', () => {
    it('should validate and structure resume data', () => {
      const input = {
        name: 'John Doe',
        contact: 'john@example.com',
        fullText: 'Full resume text...',
      };

      const result = validateResumeData(input);

      expect(result).toEqual({
        name: 'John Doe',
        contact: 'john@example.com',
        summary: '',
        experience: '',
        education: '',
        skills: '',
        fullText: 'Full resume text...',
      });
    });

    it('should handle missing fields with defaults', () => {
      const input = {
        fullText: 'Only full text provided',
      };

      const result = validateResumeData(input);

      expect(result.name).toBe('');
      expect(result.contact).toBe('');
      expect(result.fullText).toBe('Only full text provided');
    });

    it('should handle string input', () => {
      const input = 'String resume content';

      const result = validateResumeData(input);

      expect(result.fullText).toBe('String resume content');
      expect(result.name).toBe('');
    });
  });

  describe('validateJobData', () => {
    it('should validate and structure job data', () => {
      const input = {
        title: 'Software Engineer',
        company: 'TechCorp',
        fullText: 'Full job description...',
      };

      const result = validateJobData(input);

      expect(result).toEqual({
        title: 'Software Engineer',
        company: 'TechCorp',
        requirements: '',
        description: '',
        fullText: 'Full job description...',
      });
    });

    it('should handle missing fields with defaults', () => {
      const input = {
        fullText: 'Only job text provided',
      };

      const result = validateJobData(input);

      expect(result.title).toBe('');
      expect(result.company).toBe('');
      expect(result.fullText).toBe('Only job text provided');
    });

    it('should handle string input', () => {
      const input = 'String job content';

      const result = validateJobData(input);

      expect(result.fullText).toBe('String job content');
      expect(result.title).toBe('');
    });
  });
});