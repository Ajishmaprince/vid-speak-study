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
            content: 'You are an expert at creating visual flowcharts and diagrams using Mermaid syntax. Create clear, visual diagrams with proper shapes, arrows, and structure - NOT text explanations.'
          },
          {
            role: 'user',
            content: `Create a VISUAL flowchart diagram for: "${topic}"

CRITICAL RULES:
- Create an ACTUAL DIAGRAM with nodes and arrows
- Use boxes, diamonds, circles for different elements
- Show flow with arrows (-->)
- Keep labels SHORT (3-5 words max per node)
- NO long text explanations inside nodes
- Use proper Mermaid syntax: flowchart TD or graph TD
- Include at least 8-12 connected nodes
- Use subgraphs for grouping related concepts if applicable

SHAPES TO USE:
- [Rectangle] for processes/concepts
- {Diamond} for decisions/questions  
- ((Circle)) for start/end points
- ([Stadium]) for important highlights

Content to visualize:
${text.substring(0, 8000)}

Return ONLY valid Mermaid code. Example format:
flowchart TD
    A[Start] --> B{Question?}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[Result]
    D --> E`
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
    const codeBlockMatch = mermaidCode.match(/```(?:mermaid)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      mermaidCode = codeBlockMatch[1];
    }

    mermaidCode = mermaidCode.trim();

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
