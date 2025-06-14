
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const languageMap: Record<string, string> = {
  spanish: 'es',
  french: 'fr',
  mandarin: 'zh-CN',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, targetLanguage: uiTargetLanguage } = await req.json()
    const apiKey = Deno.env.get('GOOGLE_API_KEY')
    
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set in environment variables.")
    }

    const targetLanguage = languageMap[uiTargetLanguage] || uiTargetLanguage;

    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          format: 'text',
        }),
      }
    )

    if (!res.ok) {
        const errorData = await res.json();
        console.error('Google Translate API error:', errorData);
        throw new Error(`Google Translate API error: ${res.statusText}`)
    }

    const data = await res.json()
    const translatedText = data.data.translations[0].translatedText

    return new Response(JSON.stringify({ translatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(`Translation function error: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
