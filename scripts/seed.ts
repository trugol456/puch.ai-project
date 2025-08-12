import { supabaseAdmin } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Create sample user
    const userId = uuidv4();
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: 'demo@example.com',
      })
      .select()
      .single();

    if (userError) {
      console.warn('User creation failed (might already exist):', userError.message);
    } else {
      console.log('✅ Created sample user:', user.email);
    }

    // Create sample job posting
    const jobId = uuidv4();
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert({
        id: jobId,
        user_id: userId,
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        url: 'https://example.com/jobs/senior-software-engineer',
        content: `Senior Software Engineer - TechCorp Inc.

We are seeking a Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.

Key Requirements:
• 5+ years of experience in software development
• Proficiency in JavaScript, TypeScript, React, and Node.js
• Experience with cloud platforms (AWS, GCP, Azure)
• Strong understanding of database design and optimization
• Experience with containerization (Docker, Kubernetes)
• Excellent problem-solving skills and attention to detail
• Strong communication and teamwork abilities

Responsibilities:
• Design and implement new features for our web platform
• Collaborate with cross-functional teams to deliver high-quality software
• Mentor junior developers and conduct code reviews
• Optimize application performance and scalability
• Participate in architectural decisions and technical planning

We offer competitive salary, excellent benefits, remote work options, and opportunities for professional growth in a fast-paced startup environment.`,
      })
      .select()
      .single();

    if (jobError) {
      console.error('❌ Job creation failed:', jobError);
      throw jobError;
    }
    console.log('✅ Created sample job:', job.title);

    // Create sample file record
    const fileId = uuidv4();
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .insert({
        id: fileId,
        user_id: userId,
        filename: 'john_doe_resume.pdf',
        file_size: 245760, // 240KB
        file_type: 'application/pdf',
        storage_path: `${fileId}.pdf`,
        text_content: `John Doe
Software Engineer

Contact Information:
Email: john.doe@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe

Professional Summary:
Experienced software engineer with 6 years of experience building scalable web applications. Proficient in JavaScript, React, Node.js, and cloud technologies. Passionate about clean code, test-driven development, and continuous learning.

Technical Skills:
• Programming Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Vue.js, HTML5, CSS3, Sass
• Backend: Node.js, Express, Python Flask, RESTful APIs
• Databases: PostgreSQL, MongoDB, Redis
• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD
• Tools: Git, Jest, Webpack, VS Code

Work Experience:

Software Engineer | ABC Technology (2020 - Present)
• Developed and maintained React-based web applications serving 100k+ users
• Built RESTful APIs using Node.js and Express with PostgreSQL database
• Implemented automated testing with Jest, achieving 90% code coverage
• Collaborated with cross-functional teams in Agile environment
• Optimized application performance, reducing load times by 40%

Junior Software Engineer | XYZ Startup (2018 - 2020)
• Built responsive web interfaces using React and modern CSS
• Participated in code reviews and followed best practices
• Worked with senior engineers to deliver features on time
• Contributed to documentation and technical specifications

Education:
Bachelor of Science in Computer Science
State University (2014 - 2018)
GPA: 3.7/4.0

Projects:
• Personal Portfolio Website - React, TypeScript, deployed on AWS
• Task Management App - Full-stack application with React and Node.js
• Open Source Contributions - Contributed to several NPM packages

Certifications:
• AWS Solutions Architect Associate (2021)
• Certified Kubernetes Administrator (2022)`,
      })
      .select()
      .single();

    if (fileError) {
      console.error('❌ File creation failed:', fileError);
      throw fileError;
    }
    console.log('✅ Created sample file:', file.filename);

    // Create sample version
    const versionId = uuidv4();
    const publicToken = Math.random().toString(36).substring(2, 12);
    
    const sampleResumeHtml = `
<div class="resume">
  <h1>John Doe</h1>
  <h2>Senior Software Engineer</h2>
  
  <div class="section">
    <h3>Contact Information</h3>
    <p>Email: [email protected]</p>
    <p>Phone: [phone number]</p>
    <p>LinkedIn: linkedin.com/in/johndoe</p>
    <p>GitHub: github.com/johndoe</p>
  </div>

  <div class="section">
    <h3>Professional Summary</h3>
    <p>Experienced software engineer with 6+ years building scalable web applications using React, Node.js, and cloud technologies. Proven track record in containerization, microservices, and performance optimization - directly aligned with TechCorp's technology stack and senior-level requirements.</p>
  </div>

  <div class="section">
    <h3>Technical Skills</h3>
    <ul>
      <li><strong>Languages:</strong> JavaScript, TypeScript, Python, Java</li>
      <li><strong>Frontend:</strong> React, Vue.js, HTML5, CSS3</li>
      <li><strong>Backend:</strong> Node.js, Express, RESTful APIs</li>
      <li><strong>Cloud & DevOps:</strong> AWS, Docker, Kubernetes, CI/CD</li>
      <li><strong>Databases:</strong> PostgreSQL, MongoDB, Redis</li>
    </ul>
  </div>

  <div class="section">
    <h3>Work Experience</h3>
    
    <div class="job">
      <h4>Software Engineer | ABC Technology (2020 - Present)</h4>
      <ul>
        <li>Developed and maintained React-based web applications serving 100k+ users</li>
        <li>Built RESTful APIs using Node.js and Express with PostgreSQL database</li>
        <li>Implemented containerization with Docker and Kubernetes for scalable deployments</li>
        <li>Optimized application performance, reducing load times by 40%</li>
        <li>Mentored 3 junior developers and conducted comprehensive code reviews</li>
      </ul>
    </div>

    <div class="job">
      <h4>Junior Software Engineer | XYZ Startup (2018 - 2020)</h4>
      <ul>
        <li>Built responsive web interfaces using React and modern CSS</li>
        <li>Collaborated with cross-functional teams in Agile environment</li>
        <li>Contributed to architectural decisions and technical planning</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <h3>Education</h3>
    <p><strong>Bachelor of Science in Computer Science</strong><br>
    State University (2014 - 2018) | GPA: 3.7/4.0</p>
  </div>

  <div class="section">
    <h3>Certifications</h3>
    <ul>
      <li>AWS Solutions Architect Associate (2021)</li>
      <li>Certified Kubernetes Administrator (2022)</li>
    </ul>
  </div>
</div>`;

    const sampleCoverHtml = `
<div class="cover-letter">
  <p>Dear TechCorp Inc. Hiring Manager,</p>
  
  <p>I am writing to express my strong interest in the Senior Software Engineer position at TechCorp Inc. With over 6 years of experience in software development and a proven track record in the exact technologies mentioned in your job posting - JavaScript, TypeScript, React, Node.js, and cloud platforms - I am excited about the opportunity to contribute to your dynamic team.</p>
  
  <p>In my current role at ABC Technology, I have successfully designed and maintained React-based applications serving 100k+ users while building scalable APIs with Node.js and PostgreSQL. My experience with containerization using Docker and Kubernetes, combined with my AWS Solutions Architect certification, directly aligns with your requirements for cloud platform expertise. Additionally, I have mentored junior developers and conducted code reviews, demonstrating the leadership and teamwork abilities you seek.</p>
  
  <p>What particularly excites me about TechCorp is your focus on scalable web applications and architectural innovation. My experience optimizing application performance by 40% and participating in technical planning decisions has prepared me to make immediate contributions to your engineering challenges. I am eager to bring my passion for clean code and continuous learning to help drive TechCorp's technical excellence forward.</p>
  
  <p>I would welcome the opportunity to discuss how my technical expertise and collaborative approach can contribute to TechCorp's continued success. Thank you for your consideration.</p>
  
  <p>Sincerely,<br>John Doe</p>
</div>`;

    const { data: version, error: versionError } = await supabaseAdmin
      .from('versions')
      .insert({
        id: versionId,
        user_id: userId,
        file_id: fileId,
        job_id: jobId,
        title: 'Resume for Senior Software Engineer at TechCorp Inc.',
        resume_html: sampleResumeHtml.replace('[email protected]', 'john.doe@email.com').replace('[phone number]', '(555) 123-4567'),
        resume_html_redacted: sampleResumeHtml,
        cover_html: sampleCoverHtml,
        cover_html_redacted: sampleCoverHtml,
        public_token: publicToken,
        views: 42,
        is_public: true,
      })
      .select()
      .single();

    if (versionError) {
      console.error('❌ Version creation failed:', versionError);
      throw versionError;
    }
    console.log('✅ Created sample version:', version.title);
    console.log(`📄 Public share URL: /s/${publicToken}`);

    // Create some sample view records
    const viewIds = [uuidv4(), uuidv4(), uuidv4()];
    const { error: viewsError } = await supabaseAdmin
      .from('views')
      .insert([
        {
          id: viewIds[0],
          version_id: versionId,
          session_id: 'demo_session_1',
          referrer: 'https://linkedin.com',
          user_agent: 'Mozilla/5.0 (Demo Browser)',
          viewed_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: viewIds[1],
          version_id: versionId,
          session_id: 'demo_session_2',
          referrer: 'https://google.com',
          user_agent: 'Mozilla/5.0 (Demo Browser)',
          viewed_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        },
        {
          id: viewIds[2],
          version_id: versionId,
          session_id: 'demo_session_3',
          user_agent: 'Mozilla/5.0 (Demo Browser)',
          viewed_at: new Date().toISOString(), // Now
        },
      ]);

    if (viewsError) {
      console.warn('⚠️ View records creation failed:', viewsError);
    } else {
      console.log('✅ Created sample view records');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   User: demo@example.com`);
    console.log(`   Job: ${job.title} at ${job.company}`);
    console.log(`   File: ${file.filename}`);
    console.log(`   Version: ${version.title}`);
    console.log(`   Share URL: http://localhost:3000/s/${publicToken}`);
    console.log('\n🚀 You can now test the application with this sample data!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();