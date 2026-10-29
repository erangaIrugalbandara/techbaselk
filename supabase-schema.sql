-- Supabase SQL Schema for IdeaLabz / Tech Base LK
-- Run this in your Supabase SQL Editor (supabase.com → Project → SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- CATEGORIES TABLE
-- ===========================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories (you can rename these later)
INSERT INTO categories (name, slug) VALUES
  ('Category 1', 'category-1'),
  ('Category 2', 'category-2'),
  ('Category 3', 'category-3'),
  ('Category 4', 'category-4'),
  ('Category 5', 'category-5'),
  ('Category 6', 'category-6'),
  ('Category 7', 'category-7');

-- ===========================
-- PROMPTS TABLE
-- ===========================
CREATE TABLE prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  youtube_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public can read prompts and categories (no login required)
CREATE POLICY "Public can read prompts" ON prompts
  FOR SELECT USING (true);

CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

-- Only authenticated admin can insert/update/delete prompts
CREATE POLICY "Admin can insert prompts" ON prompts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update prompts" ON prompts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete prompts" ON prompts
  FOR DELETE USING (auth.role() = 'authenticated');

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
