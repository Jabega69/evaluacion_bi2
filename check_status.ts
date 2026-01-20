import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, google_tokens')
    .eq('email', '30009332.digitalprof@murciaeduca.es')
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return
  }

  console.log('User status:', data.name)
  console.log('Tokens present:', !!data.google_tokens)
  if (data.google_tokens) {
    console.log('Tokens summary:', Object.keys(data.google_tokens))
  }
}

check()
