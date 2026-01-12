import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
    if (!supabaseKey) missing.push('VITE_SUPABASE_ANON_KEY');
    throw new Error(`Missing Supabase Environment Variables: ${missing.join(', ')}`);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
