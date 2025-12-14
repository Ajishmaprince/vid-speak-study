import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!text) {
      throw new Error('Text content is required');
    }

    console.log('Generating flowchart for topic:', topic);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating valid Mermaid flowchart syntax. You MUST follow strict syntax rules to avoid parse errors.'
          },
          {
            role: 'user',
            content: `Create a flowchart diagram for: "${topic}"

STRICT SYNTAX RULES - FOLLOW EXACTLY:
1. Start with: flowchart TD
2. Use ONLY simple alphanumeric node IDs (A, B, C1, Step1, etc.)
3. Node labels MUST be simple text - NO special characters like (), [], {}, <>, |, etc.
4. Use ONLY these node shapes:
   - A[Simple Text] for rectangles
   - B{Simple Text} for diamonds
   - C((Simple Text)) for circles
5. Arrows: --> or -->|label|
6. Keep labels under 5 words, letters and numbers only
7. NO quotes inside labels
8. NO parentheses () inside labels - spell out instead

EXAMPLE OF VALID CODE:
flowchart TD
    A[Start Program] --> B{Check Condition}
    B -->|Yes| C[Execute Action]
    B -->|No| D[Skip Action]
    C --> E[Continue]
    D --> E
    E --> F((End))

Content to visualize:
${text.substring(0, 4000)}

Return ONLY the mermaid code, nothing else.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    let mermaidCode = data.choices[0].message.content;

    // Extract mermaid code from markdown code blocks if present
    const codeBlockMatch = mermaidCode.match(/```(?:mermaid)?\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      mermaidCode = codeBlockMatch[1];
    }

    // Sanitize the mermaid code to fix common syntax issues
    mermaidCode = mermaidCode
      .trim()
      // Remove any remaining markdown
      .replace(/```mermaid/g, '')
      .replace(/```/g, '')
      // Fix problematic characters in node labels
      .replace(/\[([^\]]*)\(([^\)]*)\)([^\]]*)\]/g, '[($1 $2 $3)]') // Replace () inside [] 
      .replace(/\[([^\]]*)\]/g, (_match: string, label: string) => {
        // Clean up labels - remove special chars
        const cleanLabel = label
          .replace(/[()]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return `[${cleanLabel}]`;
      })
      .replace(/\{([^\}]*)\}/g, (_match: string, label: string) => {
        const cleanLabel = label
          .replace(/[()]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return `{${cleanLabel}}`;
      })
      .replace(/\(\(([^\)]*)\)\)/g, (_match: string, label: string) => {
        const cleanLabel = label
          .replace(/[()]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return `((${cleanLabel}))`;
      })
      .trim();

    console.log('Generated flowchart successfully');

    return new Response(
      JSON.stringify({ 
        mermaidCode,
        description: `Flowchart visualization for ${topic}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-flowchart function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
