
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const apiKey = Deno.env.get("GOOGLE_API_KEY");

if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set in Supabase secrets.");
}

const genAI = new GoogleGenerativeAI(apiKey!);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!apiKey) {
      throw new Error("API key for AI service is not configured.");
    }
    const { logs } = await req.json();
    if (!logs || logs.length < 2) {
      const defaultInsight = {
          insights: [{
            iconName: 'BrainCircuit',
            text: "Not enough data for deep insights yet. Keep logging to unlock patterns!",
            color: "text-gray-500",
        }]
      };
      return new Response(JSON.stringify(defaultInsight), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze the following child development logs and provide 2-3 key insights as a JSON array of objects. Each object must have 'iconName', 'text', and 'color' properties.
Available iconName values are: 'BedDouble', 'TrendingDown', 'Users', 'BrainCircuit'.
Available color values are: 'text-red-500', 'text-amber-600', 'text-green-600', 'text-gray-500'.
The insights should identify patterns, correlations, or notable trends. Be concise and empathetic.
Respond with only the raw JSON array, without any surrounding text or markdown.
Logs:\n\n${JSON.stringify(logs, null, 2)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const insights = JSON.parse(text);

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
