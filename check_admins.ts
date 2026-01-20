import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  console.log('Starting check...');
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email, role, roles, google_tokens')
  
  if (error) {
    console.error('Database Error:', error)
    return
  }

  console.log('Total users found:', users?.length)
  const withTokens = users?.filter(u => u.google_tokens)
  console.log('Users with Google tokens:', withTokens?.length)
  
  users?.forEach(u => {
    const hasTokens = !!u.google_tokens;
    console.log(`- [${hasTokens ? 'X' : ' '}] ${u.name} (${u.email}) | Role: ${u.role} | Roles: ${JSON.stringify(u.roles)}`)
  })
}

check().then(() => console.log('Check finished.')).catch(console.error);
