# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" 
4. Copy the generated API key

### 2. Set Up Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your API key
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Upload a resume file (PDF/DOCX/TXT)
3. Add a job posting (URL or text)
4. Click "Generate Tailored Resume & Cover Letter"

## 🛠️ Troubleshooting

### "Gemini API error: Not Found"
- ✅ Check your API key is correct
- ✅ Make sure you copied the full key without spaces
- ✅ Verify the API key has proper permissions

### "API quota exceeded"
- ✅ Check your [API usage](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com)
- ✅ Gemini has free tier limits - wait or upgrade

### "Content generation was blocked"
- ✅ The content triggered safety filters
- ✅ Try with different resume/job content

### Demo Mode (No API Key)
- ✅ App works without API key in development
- ✅ Uses mock AI responses for testing
- ✅ Set `NODE_ENV=development` in `.env.local`

## 📚 Advanced Setup

### Using Supabase (Optional)
1. Create project at [supabase.com](https://supabase.com)
2. Run the SQL from `db/migrations.sql`
3. Add Supabase credentials to `.env.local`
4. Create storage buckets: `resumes` and `exports`

### Local Development Only
- No Supabase needed for basic functionality
- Files stored in `./uploads/` directory
- Mock database responses for testing

## 🎯 Next Steps

- Deploy to Vercel/Netlify
- Set up production Supabase instance
- Configure custom domain
- Add analytics and monitoring

---

**Need help?** Check the main [README.md](README.md) for detailed documentation.