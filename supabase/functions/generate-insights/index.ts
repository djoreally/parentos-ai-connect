import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const apiKey = Deno.env.get("GOOGLE_API_KEY");

if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set in Supabase secrets.");
}

const genAI = new GoogleGenerativeAI(apiKey!);

// Simple anonymizer function to remove a name from text
const anonymizeText = (text: string, name: string): string => {
  if (!text || !name) return text;
  // Case-insensitive replacement of the name, handling multiple words
  const regex = new RegExp(name.split(' ').join('\\s+'), 'gi');
  return text.replace(regex, "[Child's Name]");
};

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

    // --- ANONYMIZATION LOGIC ---
    let anonymizedLogs = logs;
    const childId = logs[0]?.child_id;

    if (childId) {
        const serviceRoleClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: child, error: childError } = await serviceRoleClient
            .from('children')
            .select('name')
            .eq('id', childId)
            .single();

        if (childError) {
            console.error("Error fetching child for anonymization:", childError.message);
            // Proceed with non-anonymized logs as a fallback, but log the error.
        } else if (child && child.name) {
            console.log(`Anonymizing logs for child: ${child.name}`);
            anonymizedLogs = logs.map(log => ({
                ...log,
                original_entry: {
                    ...log.original_entry,
                    title: anonymizeText(log.original_entry.title, child.name),
                    description: anonymizeText(log.original_entry.description, child.name),
                }
            }));
        }
    }
    // --- END ANONYMIZATION LOGIC ---

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Analyze the following child development logs and provide 2-3 key insights as a JSON array of objects. Each object must have 'iconName', 'text', and 'color' properties.
Available iconName values are: 'BedDouble', 'TrendingDown', 'Users', 'BrainCircuit'.
Available color values are: 'text-red-500', 'text-amber-600', 'text-green-600', 'text-gray-500'.
The insights should identify patterns, correlations, or notable trends. Be concise and empathetic.
IMPORTANT: Respond with ONLY the raw JSON array. Do not include any other text, explanations, or markdown formatting like \`\`\`json. Your entire response should be parsable as JSON.
Logs:\n\n${JSON.stringify(anonymizedLogs, null, 2)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // The model might still occasionally wrap the JSON in markdown. This removes it.
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        text = jsonMatch[1];
    }

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
