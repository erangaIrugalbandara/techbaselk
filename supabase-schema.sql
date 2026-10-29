-- =========================================================
-- Supabase SQL Schema for Tech Base LK
-- Run this in your Supabase SQL Editor (supabase.com → Project → SQL Editor)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- CATEGORIES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories (safely ignore if already inserted)
INSERT INTO categories (name, slug) VALUES
  ('Midjourney & Images', 'midjourney-images'),
  ('Video Generation', 'video-generation'),
  ('ChatGPT & Copywriting', 'chatgpt-copywriting'),
  ('Coding & Development', 'coding-development'),
  ('Marketing & Social Media', 'marketing-social-media'),
  ('Educational & Research', 'educational-research'),
  ('Creative Storytelling', 'creative-storytelling')
ON CONFLICT (slug) DO NOTHING;

-- ===========================
-- PROMPTS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  youtube_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- USER PROFILES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Prompts & Categories read policies
DROP POLICY IF EXISTS "Public can read prompts" ON prompts;
CREATE POLICY "Public can read prompts" ON prompts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

-- Admin modification policies for prompts
DROP POLICY IF EXISTS "Admin can insert prompts" ON prompts;
CREATE POLICY "Admin can insert prompts" ON prompts
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update prompts" ON prompts;
CREATE POLICY "Admin can update prompts" ON prompts
  FOR UPDATE TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin can delete prompts" ON prompts;
CREATE POLICY "Admin can delete prompts" ON prompts
  FOR DELETE TO authenticated
  USING (true);

-- Profiles policies: users can read & update only their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- ===========================
-- AUTOMATED USER CREATION TRIGGER
-- ===========================
-- Automatically creates a public profile row whenever a user signs up (via Google or Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================
-- VIEW: prompts with category info
-- ===========================
CREATE OR REPLACE VIEW prompts_with_category 
WITH (security_invoker = true) AS
  SELECT 
    p.id,
    p.title,
    p.prompt_text,
    p.youtube_url,
    p.created_at,
    p.updated_at,
    c.id AS category_id,
    c.name AS category_name,
    c.slug AS category_slug
  FROM prompts p
  LEFT JOIN categories c ON p.category_id = c.id
  ORDER BY p.created_at DESC;
