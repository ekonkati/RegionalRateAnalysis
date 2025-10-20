import { createClient } from '@supabase/supabase-js';

// Prioritize credentials from localStorage, then fall back to environment variables.
// This allows for UI-based configuration in restricted environments.
const supabaseUrl = localStorage.getItem('REACT_APP_SUPABASE_URL') || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = localStorage.getItem('REACT_APP_SUPABASE_ANON_KEY') || process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if the variables are placeholders or actually set.
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('YOUR_SUPABASE_URL') &&
  !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY');

let supabaseInstance: any;

if (isSupabaseConfigured) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(`
    ****************************************************************
    *                                                              *
    *        SUPABASE IS NOT CONFIGURED.                           *
    *        The app will now prompt for credentials in the UI.    *
    *                                                              *
    ****************************************************************
  `);
}

/**
 * Saves Supabase credentials to localStorage.
 * This is used by the configuration UI.
 * @param url The Supabase project URL.
 * @param key The Supabase anon public key.
 */
export const setSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('REACT_APP_SUPABASE_URL', url);
  localStorage.setItem('REACT_APP_SUPABASE_ANON_KEY', key);
};

export const supabase = supabaseInstance;