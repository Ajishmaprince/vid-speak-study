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
            content: 'You are an expert at creating clear, educational flowcharts using Mermaid syntax. Create logical, well-structured flowcharts that help students understand concepts.'
          },
          {
            role: 'user',
            content: `Analyze the following content about "${topic}" and create a comprehensive Mermaid flowchart diagram.

The flowchart should:
- Show the main concept flow and relationships
- Use clear, concise labels
- Include decision points where relevant
- Be structured top-to-bottom (graph TD)
- Use appropriate shapes (rectangles for processes, diamonds for decisions, etc.)

Content:
${text.substring(0, 8000)}

Return ONLY valid Mermaid code starting with "graph TD" or "flowchart TD".`
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
