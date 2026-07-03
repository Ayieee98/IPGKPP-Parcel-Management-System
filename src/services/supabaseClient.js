import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xlsosjhrqyjroipowwdq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsc29zamhycXlqcm9pcG93d2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDgwOTAsImV4cCI6MjA5NzA4NDA5MH0.Z7_0-BVUKQHy5m70gcxfxzlPRmqhQ8Z9A1Khs1MTSFI'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Export values for other modules that may expect named exports
export const supabaseAnonKey = supabaseKey
export { supabaseUrl }

export const isCloudConfigured = true