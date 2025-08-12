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
      // Use the correct Gemini API endpoint
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      console.log('Making Gemini API request to:', url.replace(apiKey, '***'));
      
      const requestBody = {
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
          maxOutputTokens: options.maxTokens || 4096, // Increased from 2048
          temperature: options.temperature || 0.7,
          topP: 0.8,
          topK: 40,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        
        if (response.status === 404) {
          throw new Error(`Gemini API endpoint not found. Check if model "${model}" is correct and API key is valid.`);
        } else if (response.status === 403) {
          throw new Error('Gemini API access forbidden. Check your API key permissions.');
        } else if (response.status === 429) {
          throw new Error('Gemini API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Gemini API response structure:', JSON.stringify(data, null, 2));
      
      // Handle different response structures and edge cases
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        
        // Check for blocked content
        if (candidate.finishReason === 'SAFETY') {
          throw new Error('Content generation was blocked due to safety filters');
        }
        
        // Handle MAX_TOKENS case
        if (candidate.finishReason === 'MAX_TOKENS') {
          console.warn('Response was truncated due to max tokens limit');
          // Still try to extract what we have
        }
        
        // Check for content with parts (standard structure)
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          const text = candidate.content.parts[0].text;
          if (text && text.trim()) {
            return text.trim();
          }
        }
        
        // Alternative: check for content without parts (sometimes the structure varies)
        if (candidate.content && typeof candidate.content === 'string') {
          return candidate.content.trim();
        }
        
        // Alternative: check for direct text in candidate
        if (candidate.text) {
          return candidate.text.trim();
        }
        
        // Alternative: check for output field
        if (candidate.output) {
          return candidate.output.trim();
        }
        
        // If we have a candidate but no readable content
        console.error('Candidate found but no readable content:', candidate);
        
        // Check if the response was empty due to MAX_TOKENS at the very start
        if (candidate.finishReason === 'MAX_TOKENS') {
          throw new Error('Response was truncated. Try reducing the prompt length or increasing maxTokens.');
        }
      }
      
      // Check for error in response
      if (data.error) {
        throw new Error(`Gemini API returned error: ${data.error.message || 'Unknown error'}`);
      }
      
      console.error('Unexpected Gemini API response format:', data);
      throw new Error('No content found in Gemini API response');
      
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      // If it's already our custom error, re-throw it
      if (error.message.includes('Gemini API') || 
          error.message.includes('Content generation was blocked') ||
          error.message.includes('truncated') ||
          error.message.includes('No content found')) {
        throw error;
      }
      
      // For network or other errors
      throw new Error(`Failed to generate completion with Gemini: ${error.message}`);
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
    'Please set GEMINI_API_KEY environment variable. ' +
    'Get your API key from https://makersuite.google.com/app/apikey'
  );
}

// Mock implementation for testing
export const mockGenerateCompletion = async (
  prompt: string,
  options: GeminiOptions = {}
): Promise<string> => {
  // Return deterministic mock response for tests
  if (prompt.includes('tailor resume') || prompt.includes('ORIGINAL RESUME')) {
    return `<div class="resume">
      <h1>Ujjwal Rai</h1>
      <h2>Backend Developer Intern</h2>
      
      <div class="section">
        <h3>Contact Information</h3>
        <p>Hyderabad, Telangana</p>
        <p>Email: [email protected]</p>
        <p>Phone: [phone number]</p>
        <p>LinkedIn | GitHub | Codeforces | GeeksforGeeks</p>
      </div>
      
      <div class="section">
        <h3>Education</h3>
        <p><strong>B.Tech - Computer Science and Engineering</strong><br>
        Indian Institute of Information Technology, Nagpur (2022 – 2026)</p>
      </div>
      
      <div class="section">
        <h3>Technical Skills</h3>
        <ul>
          <li>Backend Development: Node.js, Python, Java, Express.js</li>
          <li>Databases: MongoDB, MySQL, PostgreSQL, Redis</li>
          <li>Cloud Platforms: AWS, Google Cloud Platform</li>
          <li>Programming: Data Structures, Algorithms, System Design</li>
          <li>Tools: Git, Docker, REST APIs, Microservices</li>
        </ul>
      </div>
      
      <div class="section">
        <h3>Projects & Experience</h3>
        <ul>
          <li>Developed scalable backend APIs using Node.js and Express.js</li>
          <li>Implemented efficient database schemas and query optimization</li>
          <li>Built RESTful services with proper authentication and authorization</li>
          <li>Experience with cloud deployment and containerization using Docker</li>
          <li>Strong problem-solving skills demonstrated through competitive programming</li>
        </ul>
      </div>
    </div>`;
  }
  
  if (prompt.includes('cover letter') || prompt.includes('CANDIDATE RESUME')) {
    return `<div class="cover-letter">
      <p>Dear 10x Hiring Team,</p>
      
      <p>I am writing to express my strong interest in the Backend Intern position at 10x in Bengaluru. As a B.Tech Computer Science student at IIIT Nagpur, I am excited about the opportunity to contribute to your innovative technology team.</p>
      
      <p>My academic background in computer science, combined with hands-on experience in backend development using Node.js and Python, aligns well with your internship requirements. I have worked on several projects involving API development, database design, and cloud deployment, which has given me a solid foundation in backend technologies.</p>
      
      <p>I am particularly drawn to 10x's mission of accelerating growth through technology. I would welcome the opportunity to discuss how my technical skills and enthusiasm for backend development can contribute to your team's success.</p>
      
      <p>Thank you for considering my application. I look forward to hearing from you.</p>
      
      <p>Sincerely,<br>Ujjwal Rai</p>
    </div>`;
  }
  
  if (prompt.includes('Remove all email addresses') || prompt.includes('phone numbers')) {
    // Simple redaction for mock
    return prompt
      .replace(/ujjwal3654@gmail\.com/g, '[email protected]')
      .replace(/\+91-9951718692/g, '[phone number]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email protected]')
      .replace(/\b\+?[\d\s\-\(\)]{10,}\b/g, '[phone number]');
  }
  
  return 'Mock completion response';
};