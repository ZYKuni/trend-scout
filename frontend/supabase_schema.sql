-- Users table (managed by Supabase Auth, but usually we extend it or just link to it)
-- For this simple app, we'll assume an anonymous or simple user structure, 
-- but best practice is to rely on auth.users. 
-- Here we will create a table to store analysis history.

CREATE TABLE analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  url TEXT NOT NULL,
  product_name TEXT,
  analysis_data JSONB NOT NULL, -- Stores the full JSON result from the AI
  user_id UUID -- Optional: link to auth.users if authentication is implemented
);

-- Enable Row Level Security (RLS)
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read/write for now (for demonstration purposes since we don't have auth setup yet)
-- In production, you would restrict this to authenticated users only.
CREATE POLICY "Public Access" ON analysis_history
FOR ALL
USING (true)
WITH CHECK (true);
