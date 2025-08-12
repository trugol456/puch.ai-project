# One-Click Resume Tailor

![Build Status](https://github.com/username/one-click-resume-tailor/workflows/CI/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

An AI-powered resume customization tool that helps job seekers tailor their resumes and cover letters for specific job postings. Built with Next.js, TypeScript, Supabase, and Google Gemini AI.

## ✨ Features

- **🔄 One-Click Processing**: Upload resume → Add job → Generate tailored content
- **📄 Multi-Format Support**: PDF, DOCX, DOC, and TXT resume uploads
- **🌐 Job Fetching**: Extract job details from URLs or paste job descriptions
- **🤖 AI-Powered Tailoring**: Uses Google Gemini to create ATS-friendly resumes
- **📝 Cover Letter Generation**: Automatically generates personalized cover letters
- **🔒 Privacy Protection**: Redacts sensitive information for public sharing
- **📊 Analytics**: Track views and engagement on shared resumes
- **📱 Responsive Design**: Works on desktop and mobile devices
- **⚡ Fast PDF Export**: Generate professional PDFs with Puppeteer

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (or local development setup)
- Google Gemini API key

### 1. Installation

```bash
git clone https://github.com/username/one-click-resume-tailor.git
cd one-click-resume-tailor
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# App Configuration
APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Database Setup

**Option A: Supabase (Recommended)**

1. Create a new Supabase project
2. Run the migration SQL in your Supabase SQL editor:

```bash
# Copy the contents of db/migrations.sql and run in Supabase dashboard
```

3. Create storage buckets:
   - `resumes` (private)
   - `exports` (private)

**Option B: Local Development**

For local development, the app will use local filesystem storage and you can skip the Supabase setup.

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🐳 Docker Support

```dockerfile
# Build image
docker build -t one-click-resume-tailor .

# Run container
docker run -p 3000:3000 --env-file .env.local one-click-resume-tailor
```

## 📚 API Reference

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload resume file |
| `/api/fetch-job` | POST | Fetch job posting |
| `/api/generate` | POST | Generate tailored content |
| `/api/export` | POST | Export to PDF |
| `/api/save-version` | POST | Save and share version |
| `/api/redact` | POST | Redact sensitive info |
| `/api/metrics/view` | POST | Track view metrics |

### Example Usage

**Upload Resume:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@resume.pdf"
```

**Generate Content:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "resume-file-id",
    "jobText": "Software Engineer position requiring React and Node.js..."
  }'
```

## 🏗️ Architecture

```
├── pages/
│   ├── api/          # API endpoints
│   ├── s/            # Public share pages
│   └── index.tsx     # Main application
├── lib/
│   ├── supabase.ts   # Database client
│   ├── gemini.ts     # AI integration
│   ├── prompts.ts    # Prompt templates
│   └── storage-adapters/ # File storage
├── scripts/
│   ├── seed.ts       # Database seeding
│   └── generate-pdf.ts # PDF utilities
├── __tests__/        # Test suites
└── db/
    └── migrations.sql # Database schema
```

## 🔧 Configuration

### Gemini AI Setup

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set `GEMINI_API_KEY` in your environment
3. Optionally configure `GEMINI_MODEL` (default: `gemini-pro`)

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and keys from Settings → API
3. Run the migration SQL to create tables
4. Create storage buckets for file uploads

### Storage Configuration

The app supports two storage modes:

- **Production**: Supabase Storage (encrypted, scalable)
- **Development**: Local filesystem (`./uploads/`)

## 🛡️ Security Considerations

- ✅ Service role key is server-side only
- ✅ File uploads are validated and scanned
- ✅ PII is redacted before public sharing
- ✅ Rate limiting recommended for production
- ✅ Puppeteer runs with security flags

### Production Hardening TODOs

```typescript
// Add these for production deployment:
// - Redis-based rate limiting
// - Enhanced Puppeteer security
// - File virus scanning
// - CDN for file serving
// - Environment-specific configs
```

## 🎯 Hackathon Submission

### Puch.ai Submission Checklist

- [ ] **Demo GIF**: Record 30-60 second demo showing full workflow
- [ ] **Pitch Deck**: 3-5 slides explaining the problem and solution
- [ ] **GitHub Repo**: Clean, documented code with README
- [ ] **Live Demo**: Deployed version with sample data

### Files to Include

```
one-click-resume-tailor/
├── README.md           # This file
├── PROMPTS.md         # AI prompt documentation
├── demo.gif           # Demo recording
├── pitch-deck.pdf     # Presentation slides
└── .env.example       # Configuration template
```

### Submission Command

```bash
/hackathon submission add
Title: One-Click Resume Tailor
Description: AI-powered resume customization tool that helps job seekers tailor their resumes and cover letters for specific job postings using Google Gemini AI. Features include multi-format file upload, job URL parsing, ATS-friendly optimization, privacy-focused sharing, and professional PDF export.
GitHub: https://github.com/username/one-click-resume-tailor
Demo: https://one-click-resume-tailor.vercel.app
```

### Demo GIF Creation

1. Record screen using OBS, QuickTime, or similar
2. Show complete workflow: Upload → Job → Generate → Export/Share
3. Keep it under 60 seconds and 10MB
4. Use [ezgif.com](https://ezgif.com) to optimize if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI-powered content generation
- [Supabase](https://supabase.com/) for backend infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [Puppeteer](https://pptr.dev/) for PDF generation
- [Tailwind CSS](https://tailwindcss.com/) for styling inspiration

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/username/one-click-resume-tailor/issues)

---

**Made with ❤️ for job seekers everywhere**