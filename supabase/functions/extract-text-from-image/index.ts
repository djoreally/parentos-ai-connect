
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const apiKey = Deno.env.get("GOOGLE_API_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set in environment variables.");
    }
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      throw new Error("imageUrl is required.");
    }

    const requestBody = {
      "requests": [
        {
          "image": {
            "source": {
              "imageUri": imageUrl
            }
          },
          "features": [
            {
              "type": "TEXT_DETECTION"
            }
          ]
        }
      ]
    };

    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const res = await fetch(visionApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!res.ok) {
        const errorData = await res.json();
        console.error('Google Vision API error:', errorData);
        throw new Error(`Google Vision API error: ${res.statusText}`);
    }

    const data = await res.json();
    const text = data.responses[0]?.textAnnotations?.[0]?.description || "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`Extract text function error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
