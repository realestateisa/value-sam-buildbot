import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are SAM, a helpful and friendly AI assistant for Creekside Homes. Your role is to:

1. Answer questions about Creekside Homes' services, properties, and offerings
2. Help potential customers understand their options
3. Guide users through the process of scheduling consultations or requesting callbacks
4. Provide accurate information based on Creekside Homes' knowledge base

Guidelines:
- Be warm, professional, and helpful
- Keep responses clear and concise
- When users express interest in scheduling appointments, encourage them to use the "Schedule Appointment" button
- If users prefer a callback, guide them to the callback form
- Always prioritize the customer's needs and questions
- Use the knowledge base to provide accurate, up-to-date information

Remember: You represent Creekside Homes' commitment to excellent customer service and helping people find their dream homes.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json();
    console.log('Received request:', { messageCount: messages?.length, sessionId });

    const CUSTOMGPT_API_KEY = Deno.env.get('CUSTOMGPT_API_KEY_CREEKSIDE');
    const CUSTOMGPT_PROJECT_ID = Deno.env.get('CUSTOMGPT_PROJECT_ID_CREEKSIDE');

    if (!CUSTOMGPT_API_KEY || !CUSTOMGPT_PROJECT_ID) {
      console.error('Missing CustomGPT credentials');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let conversationId = sessionId;

    // Create new conversation if no session ID
    if (!conversationId) {
      console.log('Creating new conversation...');
      const createConvoResponse = await fetch(
        `https://app.customgpt.ai/api/v1/projects/${CUSTOMGPT_PROJECT_ID}/conversations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CUSTOMGPT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'Creekside Chat Session' }),
        }
      );

      if (!createConvoResponse.ok) {
        const errorText = await createConvoResponse.text();
        console.error('Failed to create conversation:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to initialize conversation' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const convoData = await createConvoResponse.json();
      conversationId = convoData.data.id;
      console.log('Created conversation:', conversationId);
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage?.content || '';

    console.log('Sending message to CustomGPT...', { conversationId, promptLength: userPrompt.length });

    // Send message to CustomGPT
    const messageResponse = await fetch(
      `https://app.customgpt.ai/api/v1/projects/${CUSTOMGPT_PROJECT_ID}/conversations/${conversationId}/messages?stream=false&lang=en`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CUSTOMGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          response_source: 'all',
        }),
      }
    );

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error('CustomGPT API error:', messageResponse.status, errorText);
      
      if (messageResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (messageResponse.status === 503) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again.' }),
          { 
            status: 503, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to get response from AI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const responseData = await messageResponse.json();
    console.log('Received response from CustomGPT');

    const aiMessage = responseData.data.openai_response;
    const citationIds = responseData.data.citations || [];

    // Fetch citation details if available
    let citations: Array<{ title: string; url: string }> = [];
    if (citationIds.length > 0) {
      console.log('Fetching citations...', { count: citationIds.length });
      try {
        const citationPromises = citationIds.map((citationId: number) =>
          fetch(
            `https://app.customgpt.ai/api/v1/projects/${CUSTOMGPT_PROJECT_ID}/citations/${citationId}`,
            {
              headers: {
                'Authorization': `Bearer ${CUSTOMGPT_API_KEY}`,
              },
            }
          ).then(res => res.json())
        );

        const citationResults = await Promise.all(citationPromises);
        citations = citationResults.map(result => ({
          title: result.data.title,
          url: result.data.source_url,
        }));
        console.log('Fetched citations:', citations.length);
      } catch (error) {
        console.error('Error fetching citations:', error);
      }
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        sessionId: conversationId,
        citations,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in chat-with-creekside function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
