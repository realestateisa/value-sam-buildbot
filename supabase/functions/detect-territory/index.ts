import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TERRITORIES = {
  greenville: {
    name: "Greenville",
    counties: ["Greenville County, SC", "Spartanburg County, SC", "Anderson County, SC", "Pickens County, SC", "Oconee County, SC", "Laurens County, SC", "Cherokee County, SC", "Union County, SC", "Buncombe County, NC", "Henderson County, NC", "Transylvania County, NC", "Polk County, NC", "Rutherford County, NC", "McDowell County, NC", "Yancey County, NC", "Mitchell County, NC", "Madison County, NC", "Haywood County, NC"]
  },
  columbia: {
    name: "Columbia",
    counties: ["Richland County, SC", "Lexington County, SC", "Kershaw County, SC", "Fairfield County, SC", "Newberry County, SC", "Saluda County, SC", "Calhoun County, SC", "Orangeburg County, SC", "Sumter County, SC", "Clarendon County, SC", "Lee County, SC"]
  },
  charleston: {
    name: "Charleston",
    counties: ["Charleston County, SC", "Berkeley County, SC", "Dorchester County, SC", "Colleton County, SC", "Hampton County, SC", "Jasper County, SC", "Beaufort County, SC"]
  },
  myrtleBeach: {
    name: "Myrtle Beach",
    counties: ["Horry County, SC", "Georgetown County, SC", "Williamsburg County, SC", "Marion County, SC", "Dillon County, SC", "Marlboro County, SC"]
  },
  statesville: {
    name: "Statesville",
    counties: ["Iredell County, NC", "Catawba County, NC", "Lincoln County, NC", "Gaston County, NC", "Mecklenburg County, NC", "Cabarrus County, NC", "Rowan County, NC", "Davidson County, NC", "Davie County, NC", "Yadkin County, NC", "Wilkes County, NC", "Alexander County, NC", "Caldwell County, NC", "Burke County, NC"]
  },
  oxford: {
    name: "Oxford",
    counties: ["Granville County, NC", "Vance County, NC", "Warren County, NC", "Franklin County, NC", "Wake County, NC", "Durham County, NC", "Person County, NC", "Orange County, NC", "Chatham County, NC", "Johnston County, NC", "Nash County, NC", "Edgecombe County, NC", "Halifax County, NC", "Northampton County, NC"]
  },
  wilmington: {
    name: "Wilmington",
    counties: ["New Hanover County, NC", "Brunswick County, NC", "Pender County, NC", "Onslow County, NC", "Duplin County, NC", "Sampson County, NC", "Bladen County, NC", "Columbus County, NC", "Robeson County, NC"]
  },
  wallaceNC: {
    name: "Wallace, NC",
    counties: ["Duplin County, NC", "Sampson County, NC", "Pender County, NC", "Onslow County, NC", "Jones County, NC", "Lenoir County, NC", "Wayne County, NC", "Greene County, NC"]
  },
  virginiaBeach: {
    name: "Virginia Beach",
    counties: ["Virginia Beach, VA", "Norfolk, VA", "Chesapeake, VA", "Portsmouth, VA", "Suffolk, VA", "Hampton, VA", "Newport News, VA", "York County, VA", "James City County, VA", "Gloucester County, VA", "Mathews County, VA", "Middlesex County, VA", "Isle of Wight County, VA", "Southampton County, VA", "Surry County, VA"]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const territoryKey = data.content[0].text.trim().toLowerCase();
    
    console.log('Claude detected territory:', territoryKey);

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
