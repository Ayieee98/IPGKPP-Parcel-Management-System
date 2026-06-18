import { createClient } from '@supabase/supabase-js';

// Gantikan dengan URL dan Key dari Dashboard Supabase anda
const supabaseUrl = 'https://xlsosjhrqyjroipowwdq.supabase.co';
const supabaseAnonKey = 'sb_publishable_ewTZ0PemwqQBRW_U8HK7LQ_ftuKZafB';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
