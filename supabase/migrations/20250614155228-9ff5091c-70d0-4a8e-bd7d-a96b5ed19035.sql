
-- Make user_id in journal_entries mandatory
ALTER TABLE public.journal_entries ALTER COLUMN user_id SET NOT NULL;

-- Enable Row Level Security for journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Add policies for journal_entries to ensure users only access their own data
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Enable Row Level Security for user_stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Add policies for user_stats to ensure users only access their own data
CREATE POLICY "Users can view their own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stats" ON public.user_stats FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically create a user_stats entry for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, level, xp)
  VALUES (new.id, 1, 0);
  RETURN new;
END;
$$;

-- Create a trigger to execute the function when a new user signs up
CREATE TRIGGER on_auth_user_created_create_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_stats();
