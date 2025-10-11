-- Create table for tracking notes generation
CREATE TABLE public.user_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  subject text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON public.user_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON public.user_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create table for tracking quiz completions
CREATE TABLE public.quiz_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_title text NOT NULL,
  score integer,
  total_questions integer,
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz completions"
  ON public.quiz_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz completions"
  ON public.quiz_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create table for tracking study sessions
CREATE TABLE public.study_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  duration_minutes integer NOT NULL,
  session_date timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own study sessions"
  ON public.study_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add time field to study_tasks
ALTER TABLE public.study_tasks ADD COLUMN due_time time;
ALTER TABLE public.study_tasks ADD COLUMN notification_sent boolean DEFAULT false;