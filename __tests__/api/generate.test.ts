import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/generate';

// Mock dependencies
jest.mock('../../lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

jest.mock('../../lib/gemini', () => ({
  generateCompletion: jest.fn(),
}));

jest.mock('../../lib/prompts', () => ({
  buildResumePrompt: jest.fn().mockReturnValue('mock resume prompt'),
  buildCoverLetterPrompt: jest.fn().mockReturnValue('mock cover letter prompt'),
  validateResumeData: jest.fn((data) => ({
    fullText: data.fullText || 'mock resume text',
    name: 'John Doe',
    contact: 'john@example.com',
  })),
  validateJobData: jest.fn((data) => ({
    fullText: data.fullText || 'mock job text',
    title: 'Software Engineer',
    company: 'TechCorp',
  })),
}));

describe('/api/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate resume and cover letter successfully', async () => {
    const { supabaseAdmin } = require('../../lib/supabase');
    const { generateCompletion } = require('../../lib/gemini');

    // Mock database responses
    supabaseAdmin.from().select().eq().single
      .mockResolvedValueOnce({
        data: {
          id: 'file-id',
          text_content: 'Sample resume content',
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: 'job-id',
          title: 'Software Engineer',
          company: 'TechCorp',
          content: 'Sample job posting content',
        },
        error: null,
      });

    // Mock AI generation
    generateCompletion
      .mockResolvedValueOnce('<div>Tailored resume HTML</div>')
      .mockResolvedValueOnce('<div>Cover letter HTML</div>');

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fileId: 'test-file-id',
        jobId: 'test-job-id',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.tailoredResumeHtml).toBe('<div>Tailored resume HTML</div>');
    expect(data.coverLetterHtml).toBe('<div>Cover letter HTML</div>');
    expect(data.summary).toContain('Generated tailored resume');
  });

  it('should work with raw text inputs', async () => {
    const { generateCompletion } = require('../../lib/gemini');

    // Mock AI generation
    generateCompletion
      .mockResolvedValueOnce('<div>Tailored resume from text</div>')
      .mockResolvedValueOnce('<div>Cover letter from text</div>');

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        resumeText: 'Raw resume text content',
        jobText: 'Raw job posting text content',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.tailoredResumeHtml).toBe('<div>Tailored resume from text</div>');
    expect(data.coverLetterHtml).toBe('<div>Cover letter from text</div>');
  });

  it('should handle missing file ID', async () => {
    const { supabaseAdmin } = require('../../lib/supabase');
    
    supabaseAdmin.from().select().eq().single.mockResolvedValue({
      data: null,
      error: { message: 'File not found' },
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fileId: 'nonexistent-file-id',
        jobText: 'Sample job text',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('File not found');
  });

  it('should handle AI generation errors', async () => {
    const { supabaseAdmin } = require('../../lib/supabase');
    const { generateCompletion } = require('../../lib/gemini');

    // Mock database responses
    supabaseAdmin.from().select().eq().single.mockResolvedValue({
      data: {
        id: 'file-id',
        text_content: 'Sample resume content',
      },
      error: null,
    });

    // Mock AI generation failure
    generateCompletion.mockRejectedValue(new Error('AI service unavailable'));

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fileId: 'test-file-id',
        jobText: 'Sample job text',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('AI service unavailable');
  });

  it('should reject requests without resume data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        jobText: 'Sample job text',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Either fileId or resumeText must be provided');
  });

  it('should reject requests without job data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        resumeText: 'Sample resume text',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Either jobId or jobText must be provided');
  });

  it('should reject non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });
});