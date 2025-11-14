import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitemapUrl } = await req.json();
    
    if (!sitemapUrl || typeof sitemapUrl !== 'string') {
      throw new Error('Sitemap URL is required');
    }

    console.log('Fetching sitemap from:', sitemapUrl);

    // Fetch the sitemap
    const response = await fetch(sitemapUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Parse XML to extract URLs
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "text/xml");
    
    if (!doc) {
      throw new Error('Failed to parse sitemap XML');
    }

    const urlElements = doc.querySelectorAll('url loc');
    const urls: string[] = [];

    urlElements.forEach((element) => {
      const url = element.textContent?.trim();
      if (url) {
        urls.push(url);
      }
    });

    if (urls.length === 0) {
      console.warn('No URLs found in sitemap');
    }

    console.log(`Found ${urls.length} URLs in sitemap`);

    return new Response(
      JSON.stringify({ 
        success: true,
        urls,
        count: urls.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in fetch-sitemap:', error);
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
