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
    const { topic, numQuestions = 5 } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating quiz for topic:', topic, 'with', numQuestions, 'questions');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const response = await fetch('https://api.lovable.app/v1/chat/completions', {
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
            content: `You are a quiz generator. Generate exactly ${numQuestions} multiple choice questions about the given topic. Each question must have exactly 4 options and indicate which option index (0-3) is correct. Return ONLY valid JSON in this exact format, no additional text:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "topic": "${topic}"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Generate ${numQuestions} multiple choice quiz questions about: ${topic}. Make them appropriate for students studying this topic. Ensure variety in difficulty and coverage of key concepts.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lovable AI API error:', error);
      throw new Error(`Lovable AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw AI response:', content);
    
    // Parse the JSON response
    const quizData = JSON.parse(content);
    
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz data format');
    }

    console.log('Generated', quizData.questions.length, 'questions');

    return new Response(
      JSON.stringify({ questions: quizData.questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
