import { generateCompletion, mockGenerateCompletion } from '../../lib/gemini';

// Mock fetch globally
global.fetch = jest.fn();

describe('Gemini API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  });

  describe('generateCompletion', () => {
    it('should make successful API call with API key', async () => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Generated completion text',
                },
              ],
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await generateCompletion('Test prompt');

      expect(result).toBe('Generated completion text');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('Test prompt'),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      process.env.GEMINI_API_KEY = 'test-api-key';

      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(generateCompletion('Test prompt')).rejects.toThrow(
        'Failed to generate completion with Gemini'
      );
    });

    it('should handle malformed API response', async () => {
      process.env.GEMINI_API_KEY = 'test-api-key';

      const malformedResponse = {
        candidates: [
          {
            // Missing content.parts structure
            content: {},
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(malformedResponse),
      });

      await expect(generateCompletion('Test prompt')).rejects.toThrow(
        'Unexpected response format from Gemini API'
      );
    });

    it('should throw error for service account path (not implemented)', async () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/service-account.json';

      await expect(generateCompletion('Test prompt')).rejects.toThrow(
        'Service account authentication not implemented'
      );
    });

    it('should throw error when no credentials are configured', async () => {
      await expect(generateCompletion('Test prompt')).rejects.toThrow(
        'No Gemini credentials configured'
      );
    });

    it('should use custom options', async () => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Generated with custom options',
                },
              ],
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await generateCompletion('Test prompt', {
        maxTokens: 1000,
        temperature: 0.5,
        model: 'gemini-pro-vision',
      });

      const requestBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(requestBody.generationConfig.maxOutputTokens).toBe(1000);
      expect(requestBody.generationConfig.temperature).toBe(0.5);
      expect((fetch as jest.Mock).mock.calls[0][0]).toContain('gemini-pro-vision');
    });
  });

  describe('mockGenerateCompletion', () => {
    it('should return mock resume for resume prompts', async () => {
      const result = await mockGenerateCompletion('Please tailor resume for this job');
      
      expect(result).toContain('John Doe');
      expect(result).toContain('Software Engineer');
      expect(result).toContain('<div class="resume">');
    });

    it('should return mock cover letter for cover letter prompts', async () => {
      const result = await mockGenerateCompletion('Please write a cover letter');
      
      expect(result).toContain('Dear Hiring Manager');
      expect(result).toContain('<div class="cover-letter">');
    });

    it('should return generic mock for other prompts', async () => {
      const result = await mockGenerateCompletion('Some other prompt');
      
      expect(result).toBe('Mock completion response');
    });
  });
});