import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 5, threshold = 0.7 } = await req.json();

    if (!query || typeof query !== 'string') {
      throw new Error('Query string is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Generating embedding for query:', query);

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('Embedding API error:', embeddingResponse.status, errorText);
      throw new Error(`Failed to generate query embedding: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    console.log('Searching for similar content...');

    // Perform similarity search using pgvector
    const { data: results, error: searchError } = await supabase.rpc('match_website_content', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    });

    // If the RPC function doesn't exist yet, fall back to direct query
    if (searchError && searchError.message.includes('function')) {
      console.log('RPC function not found, using direct query');
      
      const { data: directResults, error: directError } = await supabase
        .from('website_content')
        .select('id, url, title, chunk_text, metadata')
        .not('embedding', 'is', null)
        .limit(limit);

      if (directError) {
        throw new Error(`Search failed: ${directError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          results: directResults || [],
          count: directResults?.length || 0,
          note: 'Using fallback search without similarity scoring'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (searchError) {
      throw new Error(`Search failed: ${searchError.message}`);
    }

    console.log(`Found ${results?.length || 0} relevant chunks`);

    return new Response(
      JSON.stringify({ 
        success: true,
        results: results || [],
        count: results?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in search-content:', error);
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
