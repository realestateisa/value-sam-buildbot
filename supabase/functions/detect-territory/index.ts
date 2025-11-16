import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IMPORTANT: This MUST match the territories in src/types/chat.ts exactly
const TERRITORIES = {
  greenville: {
    name: "Greenville",
    counties: ["Abbeville County, SC", "Anderson County, SC", "Buncombe County, NC", "Greenwood County, SC", "Greenville County, SC", "Haywood County, NC", "Henderson County, NC", "Jackson County, NC", "Laurens County, SC", "Madison County, NC", "Oconee County, SC", "Pickens County, SC", "Polk County, NC", "Rutherford County, NC", "Spartanburg County, SC", "Transylvania County, NC", "Yancey County, NC"]
  },
  columbia: {
    name: "Columbia",
    counties: ["Barnwell County, SC", "Bamberg County, SC", "Calhoun County, SC", "Edgefield County, SC", "Fairfield County, SC", "Kershaw County, SC", "Lee County, SC", "Lexington County, SC", "McCormick County, SC", "Newberry County, SC", "Richland County, SC", "Saluda County, SC", "Sumter County, SC", "Aiken County, SC", "Clarendon County, SC", "Orangeburg County, SC"]
  },
  greensboro: {
    name: "Greensboro",
    counties: ["Davidson County, NC", "Davie County, NC", "Forsyth County, NC", "Guilford County, NC", "Randolph County, NC", "Yadkin County, NC"]
  },
  oxford: {
    name: "Oxford",
    counties: ["Alamance County, NC", "Caswell County, NC", "Durham County, NC", "Granville County, NC", "Orange County, NC", "Person County, NC", "Vance County, NC"]
  },
  monroe: {
    name: "Monroe",
    counties: ["Cherokee County, SC", "Chester County, SC", "Chesterfield County, SC", "Cleveland County, NC", "Gaston County, NC", "Lancaster County, SC", "Union County, NC", "Union County, SC", "York County, SC"]
  },
  smithfield: {
    name: "Smithfield",
    counties: ["Carteret County, NC", "Craven County, NC", "Edgecombe County, NC", "Franklin County, NC", "Greene County, NC", "Halifax County, NC", "Johnston County, NC", "Jones County, NC", "Lenoir County, NC", "Nash County, NC", "Pitt County, NC", "Sampson County, NC", "Warren County, NC", "Wayne County, NC", "Wilson County, NC", "Duplin County, NC"]
  },
  sanford: {
    name: "Sanford",
    counties: ["Anson County, NC", "Chatham County, NC", "Cumberland County, NC", "Harnett County, NC", "Hoke County, NC", "Lee County, NC", "Montgomery County, NC", "Moore County, NC", "Richmond County, NC", "Robeson County, NC", "Scotland County, NC", "Bladen County, NC", "Wake County, NC"]
  },
  statesville: {
    name: "Statesville",
    counties: ["Alexander County, NC", "Burke County, NC", "Cabarrus County, NC", "Caldwell County, NC", "Catawba County, NC", "Iredell County, NC", "Lincoln County, NC", "McDowell County, NC", "Rowan County, NC", "Stanly County, NC", "Wilkes County, NC", "Mecklenburg County, NC"]
  },
  wilmington: {
    name: "Wilmington",
    counties: ["Brunswick County, NC", "Columbus County, NC", "New Hanover County, NC", "Pender County, NC", "Onslow County, NC", "Horry County, SC", "Dillon County, SC"]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('Detecting territory for location:', location);

    const prompt = `You are a sales territory mapping assistant for Value Build Homes, a home builder operating in the Carolinas and Virginia.

Given the user's location input, determine which sales territory they belong to.

Available territories and their counties:
${Object.entries(TERRITORIES).map(([key, data]) => 
  `\n${key}: ${data.name}\nCounties: ${data.counties.join(', ')}`
).join('\n')}

User's location input: "${location}"

Your task:
1. Infer the county from the location (handle cities, zip codes, partial county names, abbreviations)
2. Match it to one of the territories above
3. Return ONLY the territory key (e.g., "greenville", "columbia", "charleston", etc.)

If you cannot determine the territory with confidence, respond with "unknown".

Respond with just the territory key, nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a territory classification assistant. Respond only with the territory key.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 120
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Full OpenAI response:', JSON.stringify(data, null, 2));

    let territoryKey = data.choices?.[0]?.message?.content?.trim().toLowerCase() || '';

    if (!territoryKey) {
      console.warn('Empty content from OpenAI, treating as unknown.');
      territoryKey = 'unknown';
    }

    console.log('ChatGPT detected territory:', territoryKey);

    if (territoryKey === 'unknown' || !TERRITORIES[territoryKey as keyof typeof TERRITORIES]) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Location not in service area',
          message: 'We couldn\'t find that location in our service areas. Please try entering a county name or city in North Carolina, South Carolina, or Virginia.'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const territory = TERRITORIES[territoryKey as keyof typeof TERRITORIES];

    return new Response(
      JSON.stringify({
        success: true,
        territoryKey,
        territory: {
          name: territory.name,
          counties: territory.counties
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in detect-territory function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
