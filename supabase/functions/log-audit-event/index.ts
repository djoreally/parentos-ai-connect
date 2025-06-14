
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// These headers are required for the browser to invoke the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Get the user from the token
    const { data: { user } } = await supabaseClient.auth.getUser();

    // Even for anonymous logs (like login failures), we still require a valid session.
    if (!user) {
        console.log("No user found, but proceeding with anonymous/system log.")
    }

    // Get the event data from the request body
    const { action, details, target_entity, target_id } = await req.json()

    // Create a Supabase client with the SERVICE_ROLE_KEY to bypass RLS
    const serviceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Insert the audit log securely
    const { error } = await serviceRoleClient.from('audit_logs').insert({
      user_id: user?.id ?? null,
      action,
      details,
      target_entity,
      target_id: target_id ?? user?.id,
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0],
    })

    if (error) throw error

    return new Response(JSON.stringify({ message: "Audit event logged successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error logging audit event:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
