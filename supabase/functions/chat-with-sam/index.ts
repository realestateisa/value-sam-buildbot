import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const CUSTOMGPT_API_KEY = Deno.env.get('CUSTOMGPT_API_KEY');
    const CUSTOMGPT_PROJECT_ID = Deno.env.get('CUSTOMGPT_PROJECT_ID');
    
    if (!CUSTOMGPT_API_KEY) {
      throw new Error('CUSTOMGPT_API_KEY is not configured');
    }
    
    if (!CUSTOMGPT_PROJECT_ID) {
      throw new Error('CUSTOMGPT_PROJECT_ID is not configured');
    }

    console.log('Processing chat request with', messages.length, 'messages');
    console.log('Using Project ID:', CUSTOMGPT_PROJECT_ID);

    // Generate a unique session ID for this conversation or use a default
    const sessionId = 'default-session';
    
    // Get the last user message as the prompt
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    // Use the conversations endpoint to get citations
    const apiUrl = `https://app.customgpt.ai/api/v1/projects/${CUSTOMGPT_PROJECT_ID}/conversations/${sessionId}/messages`;
    console.log('Calling CustomGPT API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CUSTOMGPT_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: lastUserMessage.content,
        response_source: 'default',
        stream: false,
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
    console.log('Received CustomGPT response:', data);

    // Extract the message and citation IDs from the conversation response
    const aiMessage = data.data?.openai_response || data.response || 'Sorry, I could not process your request.';
    const citationIds = data.data?.citations || [];
    let citations = [];

    if (citationIds.length > 0) {
      console.log('Fetching citation details for IDs:', citationIds);
      
      // Fetch details for each citation
      const citationPromises = citationIds.map(async (citationId: string) => {
        try {
          const citationUrl = `https://app.customgpt.ai/api/v1/projects/${CUSTOMGPT_PROJECT_ID}/citations/${citationId}`;
          const citationResponse = await fetch(citationUrl, {
            headers: {
              'Authorization': `Bearer ${CUSTOMGPT_API_KEY}`,
              'Accept': 'application/json',
            },
          });

          if (citationResponse.ok) {
            const citationData = await citationResponse.json();
            return citationData.data;
          }
          return null;
        } catch (err) {
          console.error('Error fetching citation:', citationId, err);
          return null;
        }
      });

      const citationResults = await Promise.all(citationPromises);
      citations = citationResults.filter(c => c !== null);
      console.log('Fetched citations:', citations);
    }

    return new Response(
      JSON.stringify({ 
        message: aiMessage,
        citations: citations
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
