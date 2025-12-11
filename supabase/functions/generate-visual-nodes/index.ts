/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, topic } = await req.json();
    console.log("Generating visual nodes for topic:", topic);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a visual learning expert. Create a structured visual breakdown of concepts.
            
Return ONLY a valid JSON array of nodes with this exact structure:
[
  {"id": "1", "title": "Main Concept Title", "description": "Brief description", "type": "main"},
  {"id": "2", "title": "Sub Concept 1", "description": "Explanation", "type": "sub"},
  {"id": "3", "title": "Detail 1", "description": "More detail", "type": "detail"}
]

Rules:
- Return ONLY the JSON array, no markdown, no code blocks, no explanation
- Create 4-8 nodes that flow logically from top to bottom
- Use "main" for the central concept (usually 1)
- Use "sub" for major sub-topics (2-3)
- Use "detail" for specific details or examples
- Keep titles under 30 characters
- Keep descriptions under 100 characters
- Make it educational and easy to understand`
          },
          {
            role: "user",
            content: `Create a visual breakdown for: ${topic}\n\nAdditional context: ${text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || "";
    
    // Clean up the response - remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log("Generated content:", content);

    let nodes;
    try {
      nodes = JSON.parse(content);
    } catch (parseError) {
      console.error("Parse error:", parseError);
      // Fallback nodes if parsing fails
      nodes = [
        { id: "1", title: topic, description: "Main concept overview", type: "main" },
        { id: "2", title: "Key Component", description: "Important aspect of the topic", type: "sub" },
        { id: "3", title: "Details", description: "Supporting information", type: "detail" }
      ];
    }

    console.log("Generated visual nodes successfully");

    return new Response(
      JSON.stringify({ nodes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in generate-visual-nodes:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
