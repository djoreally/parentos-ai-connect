
import { supabase } from '@/integrations/supabase/client';
import { LogEntry } from '@/types';
import { Insight } from '@/components/AiInsights';

export const getAiInsights = async (logs: LogEntry[]): Promise<Insight[]> => {
    if (!logs || logs.length === 0) {
        return [{
            iconName: 'BrainCircuit',
            text: "Not enough data for deep insights yet. Keep logging to unlock patterns!",
            color: "text-gray-500",
        }];
    }
    const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { logs },
    });

    if (error) {
        console.error("Error fetching AI insights:", error);
        throw new Error("Failed to generate AI insights.");
    }
    
    if (!data.insights || data.insights.length === 0) {
         return [{
            iconName: 'BrainCircuit',
            text: "AI analysis couldn't find specific patterns. More logs will improve accuracy.",
            color: "text-gray-500",
        }];
    }

    return data.insights;
};
