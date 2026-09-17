import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rqppqpkwzatrnaymsymc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_WOdewnKgzC7S6Swd8p7Ttw_NOh9_nEr'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
