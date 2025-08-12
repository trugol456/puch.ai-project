-- One-Click Resume Tailor Database Schema
-- Run this SQL in your Supabase SQL editor or via CLI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (optional - can use Supabase auth or simple tracking)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT,
    UNIQUE(email)
);

-- Files table - stores uploaded resume files
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    text_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table - stores job postings
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT,
    company TEXT,
    url TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Versions table - stores generated resume/cover letter versions
CREATE TABLE IF NOT EXISTS versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    resume_html TEXT NOT NULL,
    resume_html_redacted TEXT,
    cover_html TEXT NOT NULL,
    cover_html_redacted TEXT,
    public_token TEXT NOT NULL UNIQUE,
    views INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Views table - tracks page views for analytics
CREATE TABLE IF NOT EXISTS views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES versions(id) ON DELETE CASCADE,
    session_id TEXT,
    referrer TEXT,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_versions_user_id ON versions(user_id);
CREATE INDEX IF NOT EXISTS idx_versions_public_token ON versions(public_token);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_is_public ON versions(is_public);

CREATE INDEX IF NOT EXISTS idx_views_version_id ON views(version_id);
CREATE INDEX IF NOT EXISTS idx_views_viewed_at ON views(viewed_at DESC);

-- Row Level Security (RLS) policies
-- Note: Adjust these based on your authentication strategy

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;

-- Files policies
CREATE POLICY "Files are viewable by everyone (for demo)" ON files
    FOR SELECT USING (true);

CREATE POLICY "Files are insertable by everyone (for demo)" ON files
    FOR INSERT WITH CHECK (true);

-- Jobs policies  
CREATE POLICY "Jobs are viewable by everyone (for demo)" ON jobs
    FOR SELECT USING (true);

CREATE POLICY "Jobs are insertable by everyone (for demo)" ON jobs
    FOR INSERT WITH CHECK (true);

-- Versions policies
CREATE POLICY "Public versions are viewable by everyone" ON versions
    FOR SELECT USING (is_public = true);

CREATE POLICY "All versions are viewable by service role" ON versions
    FOR ALL USING (true);

CREATE POLICY "Versions are insertable by everyone (for demo)" ON versions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Versions are updatable by everyone (for demo)" ON versions
    FOR UPDATE USING (true);

CREATE POLICY "Versions are deletable by everyone (for demo)" ON versions
    FOR DELETE USING (true);

-- Views policies
CREATE POLICY "Views are insertable by everyone" ON views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Views are viewable by service role only" ON views
    FOR SELECT USING (false); -- Only service role can read

-- Storage buckets (run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false);

-- Storage policies for buckets
-- CREATE POLICY "Resume uploads are accessible to authenticated users" ON storage.objects
--     FOR ALL USING (bucket_id = 'resumes');

-- CREATE POLICY "Export files are accessible to authenticated users" ON storage.objects  
--     FOR ALL USING (bucket_id = 'exports');

-- Note: For production, replace these permissive policies with proper user-based policies