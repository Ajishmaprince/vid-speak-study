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
    const { text, filename } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for summarization');
    }

    // Extract keywords for video search
    const extractKeywords = (content: string): string[] => {
      const words = content.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 4);
      
      const wordFreq: { [key: string]: number } = {};
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      
      return Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([word]) => word);
    };

    const keywords = extractKeywords(text);

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
            content: 'You are a study notes summarization assistant. Create clear, concise summaries that capture the key points and main concepts. Use bullet points and organize information logically. Keep the summary focused and educational.'
          },
          {
            role: 'user',
            content: `Please summarize the following study notes:\n\n${text.substring(0, 5000)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    // Generate video queries based on content
    const videoQueries = keywords.slice(0, 2).map(keyword => 
      `${keyword} tutorial explanation`
    );

    // Generate tutorial suggestions
    const tutorials = keywords.map(keyword => ({
      title: `Learn more about ${keyword}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(keyword + ' tutorial')}`
    }));

    return new Response(
      JSON.stringify({ 
        summary,
        videos: videoQueries,
        tutorials: tutorials.slice(0, 3)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarize function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
