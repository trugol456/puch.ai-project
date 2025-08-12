export interface GeminiOptions {
  maxTokens?: number;
  model?: string;
  temperature?: number;
}

export async function generateCompletion(
  prompt: string,
  options: GeminiOptions = {}
): Promise<string> {
  const model = options.model || process.env.GEMINI_MODEL || 'gemini-pro';
  const apiKey = process.env.GEMINI_API_KEY;
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  // Implementation 1: REST API with API Key
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: options.maxTokens || 2048,
              temperature: options.temperature || 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // TODO: Extract text from response structure
      // Expected structure: data.candidates[0].content.parts[0].text
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('Unexpected response format from Gemini API');
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate completion with Gemini');
    }
  }

  // Implementation 2: Service Account (Google Cloud SDK approach)
  if (serviceAccountPath) {
    // TODO: Implement Google Cloud Vertex AI SDK approach
    // This would require @google-cloud/aiplatform package
    throw new Error(
      'Service account authentication not implemented. ' +
      'Please set GEMINI_API_KEY for REST API access or implement Vertex AI SDK.'
    );
  }

  // No credentials configured
  throw new Error(
    'No Gemini credentials configured. ' +
    'Please set GEMINI_API_KEY environment variable or ' +
    'GOOGLE_APPLICATION_CREDENTIALS for service account authentication.'
  );
}

// Mock implementation for testing
export const mockGenerateCompletion = async (
  prompt: string,
  options: GeminiOptions = {}
): Promise<string> => {
  // Return deterministic mock response for tests
  if (prompt.includes('tailor resume')) {
    return `<div class="resume">
      <h1>John Doe</h1>
      <h2>Software Engineer</h2>
      <p>Experienced software engineer with expertise in React, TypeScript, and Node.js.</p>
      <ul>
        <li>Built scalable web applications</li>
        <li>Implemented CI/CD pipelines</li>
        <li>Led development teams</li>
      </ul>
    </div>`;
  }
  
  if (prompt.includes('cover letter')) {
    return `<div class="cover-letter">
      <p>Dear Hiring Manager,</p>
      <p>I am writing to express my interest in the Software Engineer position.</p>
      <p>My experience in React and TypeScript makes me a strong candidate.</p>
      <p>Sincerely,<br>John Doe</p>
    </div>`;
  }
  
  return 'Mock completion response';
};