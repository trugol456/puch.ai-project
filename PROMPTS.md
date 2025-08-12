# AI Prompts Documentation

This document contains the prompt templates and AI tuning strategies used in One-Click Resume Tailor.

## 🎯 Overview

The application uses Google Gemini to generate three types of content:

1. **Tailored Resumes** - ATS-optimized resumes matching job requirements
2. **Cover Letters** - Personalized cover letters connecting experience to opportunities  
3. **Content Redaction** - Privacy protection by removing sensitive information

## 📝 Prompt Templates

### Resume Tailoring Prompt

**Purpose**: Transform a generic resume into a job-specific, ATS-friendly version.

**Key Requirements**:
- Never fabricate information
- Use only existing resume content
- Optimize for ATS scanning
- Match job posting keywords
- Convert to bullet points

**Template Structure**:
```
You are an expert resume writer and ATS optimization specialist...

CRITICAL RULES:
1. NEVER invent, add, or fabricate any dates, company names, job titles, or personal information
2. ONLY use information that already exists in the original resume
3. Optimize keyword matching with the job posting
4. Convert prose paragraphs to concise bullet points where appropriate
5. Emphasize relevant experience and skills that match the job requirements
6. Output clean HTML that renders well in browsers and is ATS-friendly

ORIGINAL RESUME:
[Resume content]

JOB POSTING:
[Job posting content]

OUTPUT FORMAT:
Return clean HTML with semantic structure...
```

### Cover Letter Generation Prompt

**Purpose**: Create compelling, personalized cover letters that connect candidate experience to job opportunities.

**Key Requirements**:
- Use only existing resume information
- Match tone to company culture
- Keep concise (3-4 paragraphs)
- Include specific job keywords
- End with strong call to action

**Template Structure**:
```
You are an expert cover letter writer...

CRITICAL RULES:
1. NEVER invent personal details, company names, or specific experiences not in the resume
2. Use only information that exists in the provided resume
3. Match the tone to the job posting and company culture
4. Keep it concise (3-4 paragraphs maximum)
5. Include specific keywords from the job posting
6. End with a strong call to action

CANDIDATE RESUME:
[Resume content]

JOB POSTING:
[Job posting content]

OUTPUT FORMAT:
Return clean HTML formatted cover letter...
```

### Content Redaction Prompt

**Purpose**: Remove sensitive personal information (emails, phone numbers) for public sharing.

**Key Requirements**:
- Preserve HTML structure
- Replace with generic placeholders
- Don't modify other content

**Template Structure**:
```
Remove all email addresses and phone numbers from the following HTML content...

RULES:
1. Replace email addresses with "[email protected]"
2. Replace phone numbers with "[phone number]"
3. Preserve all HTML structure and formatting
4. Do not modify any other content

HTML CONTENT:
[HTML content]

OUTPUT ONLY THE MODIFIED HTML:
```

## 🛠️ Tuning Guidelines

### Model Configuration

**Recommended Settings**:
```typescript
{
  model: 'gemini-pro',
  temperature: 0.7,     // Balance creativity and consistency
  maxTokens: 2048,      // Adequate for full resumes
}
```

**For Cover Letters**:
```typescript
{
  temperature: 0.8,     // Slightly more creative
  maxTokens: 1024,      // Shorter content
}
```

**For Redaction**:
```typescript
{
  temperature: 0.1,     // Very consistent, rule-based
  maxTokens: 2048,      // Preserve full content
}
```

### Optimization Strategies

#### 1. Keyword Matching
- Extract key terms from job postings
- Ensure resume highlights relevant technologies
- Use industry-standard terminology
- Match exact phrases when possible

#### 2. ATS Compatibility
- Use standard section headers
- Employ bullet points for achievements
- Include relevant keywords naturally
- Maintain clear hierarchy (H1, H2, H3)

#### 3. Content Quality
- Focus on quantifiable achievements
- Use action verbs consistently
- Maintain professional tone
- Ensure logical flow

### Common Challenges & Solutions

#### Challenge: AI Hallucination
**Problem**: AI inventing job titles, dates, or companies

**Solution**:
- Explicit prohibition in prompts
- Multiple warnings about accuracy
- Validation of output against input
- Fallback to original content if needed

#### Challenge: Generic Output
**Problem**: Responses not tailored to specific jobs

**Solution**:
- Include full job posting context
- Emphasize keyword matching requirements
- Request specific industry terminology
- Provide examples of good vs. poor tailoring

#### Challenge: Poor HTML Structure
**Problem**: Malformed or inconsistent HTML output

**Solution**:
- Specify exact HTML requirements
- Provide structure examples
- Request semantic markup
- Test with various content types

## 📊 Sample Input/Output

### Resume Tailoring Example

**Input Resume** (excerpt):
```
John Doe
Software Engineer

Experience:
- Built web applications using React and Node.js
- Worked on database design and optimization
- Collaborated with team members on various projects
```

**Input Job Posting** (excerpt):
```
Senior Frontend Developer
Requirements:
- 5+ years React experience
- Performance optimization expertise
- Leadership and mentoring abilities
```

**Output Resume** (excerpt):
```html
<h1>John Doe</h1>
<h2>Senior Frontend Developer</h2>

<div class="section">
  <h3>Experience</h3>
  <ul>
    <li>Built scalable web applications using React with focus on performance optimization</li>
    <li>Led database design and optimization initiatives improving query performance</li>
    <li>Mentored team members and collaborated on high-impact frontend projects</li>
  </ul>
</div>
```

### Cover Letter Example

**Input**: Same resume + job posting

**Output**:
```html
<div class="cover-letter">
  <p>Dear Hiring Manager,</p>
  
  <p>I am excited to apply for the Senior Frontend Developer position. With extensive React experience and a proven track record in performance optimization, I am well-positioned to contribute to your team's success.</p>
  
  <p>In my current role, I have successfully built scalable web applications using React while leading database optimization initiatives. My experience mentoring team members demonstrates the leadership abilities you seek.</p>
  
  <p>I would welcome the opportunity to discuss how my technical expertise and collaborative approach can contribute to your frontend development goals.</p>
  
  <p>Sincerely,<br>John Doe</p>
</div>
```

## 🔧 Implementation Tips

### Error Handling

```typescript
try {
  const result = await generateCompletion(prompt, options);
  return result;
} catch (error) {
  // Fallback strategies:
  // 1. Retry with different temperature
  // 2. Use simpler prompt
  // 3. Return original content with warning
  console.error('AI generation failed:', error);
  throw new Error('Unable to generate content');
}
```

### Content Validation

```typescript
function validateResumeOutput(html: string, originalResume: string): boolean {
  // Check for fabricated content
  const suspiciousPatterns = [
    /\b(CEO|CTO|Director)\b/i,  // High-level titles not in original
    /\b(2024|2025)\b/,          // Future dates
    /\$\d+[MK]/,                // Salary figures
  ];
  
  return !suspiciousPatterns.some(pattern => 
    pattern.test(html) && !pattern.test(originalResume)
  );
}
```

### Performance Optimization

```typescript
// Cache common job requirements
const industryKeywords = {
  'software': ['React', 'Node.js', 'JavaScript', 'Python'],
  'marketing': ['SEO', 'Analytics', 'Campaign', 'Content'],
  'sales': ['CRM', 'Pipeline', 'Revenue', 'Negotiation']
};

// Pre-process job postings
function extractJobKeywords(jobText: string): string[] {
  // Extract key terms for better prompt targeting
  return jobText
    .split(/\W+/)
    .filter(word => word.length > 3)
    .slice(0, 50); // Limit for token efficiency
}
```

## 📈 Monitoring & Analytics

### Success Metrics

- **Content Quality**: Manual review scores
- **ATS Compatibility**: Parsing success rates  
- **User Satisfaction**: Feedback ratings
- **Generation Speed**: Response time metrics

### A/B Testing Prompts

```typescript
const promptVariants = {
  conservative: buildResumePrompt(resume, job), // Current version
  creative: buildCreativeResumePrompt(resume, job), // More creative
  technical: buildTechnicalResumePrompt(resume, job), // Tech-focused
};

// Test and measure conversion rates
```

## 🚀 Future Enhancements

### Advanced Features

1. **Industry-Specific Prompts**: Tailored templates for different sectors
2. **Multi-Language Support**: Generate content in various languages
3. **Tone Adjustment**: Formal, casual, or industry-specific writing styles
4. **Skills Gap Analysis**: Identify missing qualifications
5. **Interview Prep**: Generate potential interview questions

### Integration Opportunities

- **LinkedIn API**: Auto-import profile data
- **Job Board APIs**: Direct integration with major platforms
- **Applicant Tracking Systems**: Direct submission capabilities
- **Calendar Integration**: Schedule follow-ups
- **Email Templates**: Automated outreach sequences

---

**Remember**: The goal is to enhance, not replace, human judgment in job applications. Always review AI-generated content for accuracy and appropriateness.