import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are SAM, a friendly and knowledgeable digital assistant for Value Build Homes. You help customers learn about Value Build Homes' services, answer questions about home building, and guide them through scheduling appointments.

About Value Build Homes:
- Value Build Homes is a custom home builder serving North Carolina and South Carolina
- They offer quality custom homes with various floor plans and customization options
- Current special: 4.875% (APR 5.736%) 30 Year Financing
- They serve multiple territories across NC and SC with both in-person and virtual appointments available

Key Information:
- Value Build Homes specializes in custom home construction
- They work with clients to design and build their dream homes
- Financing options are available
- Multiple sales territories across the Carolinas

Your responsibilities:
1. Answer questions about Value Build Homes, their services, and home building process
2. Provide information about available floor plans and customization options
3. Help determine which sales territory the customer's desired building location falls into
4. Guide customers toward booking appointments when appropriate
5. Be warm, professional, and helpful at all times

When discussing appointments:
- Ask where the customer plans to build
- Help identify the correct sales territory
- Explain whether appointments in that territory are in-person or virtual
- Guide them to book through the calendar system

Always be conversational, friendly, and focused on helping customers achieve their home building goals.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Retrieve relevant context from website content
    let contextText = '';
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Get the last user message as the query
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
        
        if (lastUserMessage && lastUserMessage.content) {
          console.log('Retrieving relevant context for query:', lastUserMessage.content);
          
          // Generate embedding for the query
          const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'text-embedding-3-small',
              input: lastUserMessage.content,
            }),
          });

          if (embeddingResponse.ok) {
            const embeddingData = await embeddingResponse.json();
            const queryEmbedding = embeddingData.data[0].embedding;

            // Search for similar content
            const { data: similarContent, error: searchError } = await supabase.rpc('match_website_content', {
              query_embedding: queryEmbedding,
              match_threshold: 0.7,
              match_count: 3
            });

            if (!searchError && similarContent && similarContent.length > 0) {
              console.log(`Found ${similarContent.length} relevant content chunks`);
              
              contextText = '\n\nRELEVANT INFORMATION FROM VALUE BUILD HOMES WEBSITE:\n\n';
              similarContent.forEach((chunk: any, index: number) => {
                contextText += `[${index + 1}] ${chunk.title}\n${chunk.chunk_text}\n\n`;
              });
              
              contextText += 'Please base your answer on this information when relevant.\n';
            } else {
              console.log('No relevant content found or search function not available yet');
            }
          }
        }
      } catch (error) {
        console.error('Error retrieving context (non-fatal):', error);
        // Continue without context if retrieval fails
      }
    }

    // Enhanced system prompt with retrieved context
    const enhancedSystemPrompt = SYSTEM_PROMPT + contextText;
    
    console.log('Processing chat request with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received AI response');

    return new Response(
      JSON.stringify({ 
        message: data.choices[0].message.content 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in chat-with-sam:', error);
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
