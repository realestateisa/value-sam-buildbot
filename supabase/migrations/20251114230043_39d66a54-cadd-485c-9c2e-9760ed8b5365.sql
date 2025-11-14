-- Create function for similarity search using pgvector
CREATE OR REPLACE FUNCTION match_website_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  url text,
  title text,
  chunk_text text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    website_content.id,
    website_content.url,
    website_content.title,
    website_content.chunk_text,
    website_content.metadata,
    1 - (website_content.embedding <=> query_embedding) as similarity
  FROM website_content
  WHERE website_content.embedding IS NOT NULL
    AND 1 - (website_content.embedding <=> query_embedding) > match_threshold
  ORDER BY website_content.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;