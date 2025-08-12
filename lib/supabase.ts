import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client (public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database types
export interface User {
  id: string;
  created_at: string;
  email?: string;
}

export interface File {
  id: string;
  user_id?: string;
  filename: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  text_content: string;
  created_at: string;
}

export interface Job {
  id: string;
  user_id?: string;
  title?: string;
  company?: string;
  url?: string;
  content: string;
  created_at: string;
}

export interface Version {
  id: string;
  user_id?: string;
  file_id?: string;
  job_id?: string;
  title: string;
  resume_html: string;
  resume_html_redacted?: string;
  cover_html: string;
  cover_html_redacted?: string;
  public_token: string;
  views: number;
  is_public: boolean;
  created_at: string;
}

export interface View {
  id: string;
  version_id: string;
  session_id?: string;
  referrer?: string;
  user_agent?: string;
  viewed_at: string;
}