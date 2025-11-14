-- Enable vector extension for pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create website content table for RAG
CREATE TABLE public.website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  last_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX website_content_embedding_idx ON public.website_content 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for URL lookups
CREATE INDEX website_content_url_idx ON public.website_content(url);

-- Enable Row Level Security
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (chatbot needs to read content)
CREATE POLICY "Allow public read access" 
ON public.website_content 
FOR SELECT 
TO public
USING (true);

-- Create policy for authenticated insert/update (for scraping functions)
CREATE POLICY "Allow service role write access" 
ON public.website_content 
FOR ALL 
TO service_role
USING (true);