
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
        const { messages, logs } = await req.json();

        // --- ANONYMIZATION LOGIC ---
        let anonymizedLogs = logs || [];
        if (logs && logs.length > 0) {
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
                    console.error("Error fetching child for anonymization in assistant:", childError.message);
                } else if (child && child.name) {
                    console.log(`Anonymizing logs for assistant for child: ${child.name}`);
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
        }
        // --- END ANONYMIZATION LOGIC ---

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const history = messages.slice(0, -1).map((msg: { sender: string; text: string; }) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        const system_prompt = `You are ParentOS Assistant, a helpful AI for parents. Your role is to analyze logs and provide summaries, insights, and answers to parent's questions. Be empathetic, concise, and helpful. You have access to the child's recent logs to provide context.

Current logs:
${JSON.stringify(anonymizedLogs, null, 2)}
`;

        history.unshift({
            role: 'user',
            parts: [{ text: system_prompt }],
        }, {
            role: 'model',
            parts: [{ text: "Understood. I'm ready to assist based on the provided logs and conversation." }]
        });
        
        const lastMessage = messages[messages.length - 1];

        const chat = model.startChat({ history });

        const result = await chat.sendMessage(lastMessage.text);
        const response = result.response;
        const text = response.text();

        return new Response(JSON.stringify({ reply: text }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in AI Assistant:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
