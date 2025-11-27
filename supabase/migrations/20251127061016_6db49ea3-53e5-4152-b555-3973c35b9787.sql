-- Create flashcards table
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies for flashcards
CREATE POLICY "Users can view their own flashcards" 
ON public.flashcards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcards" 
ON public.flashcards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards" 
ON public.flashcards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create flowcharts table
CREATE TABLE public.flowcharts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  mermaid_code TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flowcharts ENABLE ROW LEVEL SECURITY;

-- Create policies for flowcharts
CREATE POLICY "Users can view their own flowcharts" 
ON public.flowcharts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flowcharts" 
ON public.flowcharts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flowcharts" 
ON public.flowcharts 
FOR DELETE 
USING (auth.uid() = user_id);