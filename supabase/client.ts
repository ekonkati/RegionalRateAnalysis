import { createClient } from '@supabase/supabase-js';

// --- Configuration Strategy Change ---
// The Supabase credentials are now hardcoded directly in this module.
// This removes the need for the UI prompt and allows for easy migration
// to environment variables in the future.
//
// To use environment variables, replace the hardcoded strings below with:
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabaseUrl = 'https://crggiquridczhocyhlsg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZ2dpcXVyaWRjemhvY3lobHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTg0NjksImV4cCI6MjA3NjQ3NDQ2OX0._E8buHdxCUipY_WqSM6JuPUeXofc7tFaQ6CN3jDkpeg';

// Check if the variables are set.
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

let supabaseInstance: any;

if (isSupabaseConfigured) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // This block will now only be reached if the hardcoded values are removed.
  console.error("Supabase URL or Anon Key is missing. Please configure them in supabase/client.ts");
}

export const supabase = supabaseInstance;
