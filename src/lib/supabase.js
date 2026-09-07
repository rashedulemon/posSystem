import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ozvzwsviohyymtyasmfo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dnp3c3Zpb2h5eW10eWFzbWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjY0NzcsImV4cCI6MjEwNDIwMjQ3N30.MXirYg1Fn73klVm8fDALTQAsJaTJmFYAZe7YCFwy0n0';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
