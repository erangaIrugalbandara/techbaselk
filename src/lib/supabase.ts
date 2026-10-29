import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser/client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (only initialized on server if key is present)
export const getSupabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
  return createClient(supabaseUrl, serviceKey);
};

// Type definitions for database tables
export type Prompt = {
  id: string;
  title: string;
  prompt_text: string;
  youtube_url: string | null;
  category: string;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};
