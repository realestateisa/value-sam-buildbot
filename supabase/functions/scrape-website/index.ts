import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Chunk text into smaller pieces for better retrieval
function chunkText(text: string, chunkSize: number = 800, overlap: number = 200): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  let currentSize = 0;
  
  for (const sentence of sentences) {
    const sentenceSize = sentence.length;
    
    if (currentSize + sentenceSize > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      // Keep overlap from end of previous chunk
      const words = currentChunk.split(' ');
      const overlapWords = Math.floor(overlap / 5); // Rough estimate
      currentChunk = words.slice(-overlapWords).join(' ') + ' ' + sentence;
      currentSize = currentChunk.length;
    } else {
      currentChunk += sentence;
      currentSize += sentenceSize;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Filter out tiny chunks
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new Error('URLs array is required');
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Starting scrape for', urls.length, 'URLs');
    const results = [];

    for (const url of urls) {
      try {
        console.log('Scraping URL:', url);
        
        // First, delete all existing chunks for this URL to avoid stale data
        // Use LIKE pattern because chunks are stored as url#chunk-0, url#chunk-1, etc.
        const { error: deleteError } = await supabase
          .from('website_content')
          .delete()
          .like('url', `${url}%`);

        if (deleteError) {
          console.error(`Failed to delete old chunks for ${url}:`, deleteError);
          // Continue anyway - we'll try to insert new data
        } else {
          console.log(`Cleaned up old chunks for ${url}`);
        }
        
        // Scrape the URL using Firecrawl API directly
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: url,
            formats: ['markdown'],
          }),
        });

        if (!scrapeResponse.ok) {
          console.error('Failed to scrape:', url, scrapeResponse.status);
          results.push({ url, status: 'failed', error: `HTTP ${scrapeResponse.status}` });
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        
        if (!scrapeData.success) {
          console.error('Scrape unsuccessful:', url);
          results.push({ url, status: 'failed', error: 'Scrape unsuccessful' });
          continue;
        }

        const content = scrapeData.data?.markdown || '';
        const title = scrapeData.data?.metadata?.title || new URL(url).pathname;
        
        if (!content || content.length < 100) {
          console.warn('Content too short for:', url);
          results.push({ url, status: 'skipped', reason: 'Content too short' });
          continue;
        }

        // Chunk the content
        const chunks = chunkText(content);
        console.log(`Created ${chunks.length} chunks for ${url}`);

        // Store each chunk as a separate row
        for (let i = 0; i < chunks.length; i++) {
          const chunkUrl = `${url}#chunk-${i}`;
          
          const { error: insertError } = await supabase
            .from('website_content')
            .upsert({
              url: chunkUrl,
              title: `${title} (Part ${i + 1})`,
              content: content,
              chunk_text: chunks[i],
              metadata: {
                source_url: url,
                chunk_index: i,
                total_chunks: chunks.length,
                scraped_at: new Date().toISOString(),
              },
              last_scraped_at: new Date().toISOString(),
            }, {
              onConflict: 'url'
            });

          if (insertError) {
            console.error('Error inserting chunk:', insertError);
          }
        }

        results.push({ 
          url, 
          status: 'success', 
          chunks: chunks.length 
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error('Error scraping URL:', url, error);
        results.push({ 
          url, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    console.log('Scraping complete. Results:', results);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Scraping complete',
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in scrape-website:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
