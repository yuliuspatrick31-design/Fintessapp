import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[FitTracker] Missing Supabase env vars.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel project settings.'
  );
}

export const supabase = createClient(
  SUPABASE_URL      || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key'
);
