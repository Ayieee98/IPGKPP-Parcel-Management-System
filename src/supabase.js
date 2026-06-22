import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xlsosjhrqyjroipowwdq.supabase.co/rest/v1/'
const supabaseKey = 'sb_publishable_ewTZ0PemwqQBRW_U8HK7LQ_ftuKZafB'

export const supabase = createClient(supabaseUrl, supabaseKey)