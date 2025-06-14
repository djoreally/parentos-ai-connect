
import { supabase } from '@/integrations/supabase/client';
import { LogEntry } from '@/types';
import { logAuditEvent } from './audit';

const LOGS_PER_PAGE = 5;

// This function simulates fetching logs from an API.
export const getLogs = async (childId: string, page: number = 1): Promise<{logs: LogEntry[], count: number}> => {
  console.log(`Fetching logs from Supabase for child: ${childId}, page: ${page}`);
  if (!childId) return { logs: [], count: 0 };
  
  const from = (page - 1) * LOGS_PER_PAGE;
  const to = from + LOGS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from('logs')
    .select('*', { count: 'exact' })
    .eq('child_id', childId)
    .order('timestamp', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
  
  console.log("Supabase responded with logs:", data);
  // Cast to unknown first to satisfy TypeScript's stricter type checking
  return { logs: (data as unknown as LogEntry[]) || [], count: count ?? 0 };
};


/**
 * Simulates an AI analyzing the log content to generate contextual summaries,
 * tags, and an emotional score.
 * @param title The title of the log entry.
 * @param description The description of the log entry.
 * @returns AI-generated summaries, tags, and emotion score.
 */
const generateAiSummaries = (title: string, description: string) => {
  const fullText = `${title.toLowerCase()} ${description.toLowerCase()}`;
  const tags = new Set<string>();
  let emotionScore = 3; // Neutral default

  // Keyword analysis for tags and emotion
  if (fullText.includes('school') || fullText.includes('teacher')) tags.add('school');
  if (fullText.includes('doctor') || fullText.includes('sick') || fullText.includes('health') || fullText.includes('tummy')) tags.add('health');
  if (fullText.includes('sad') || fullText.includes('anxiety') || fullText.includes('crying') || fullText.includes('nightmare')) {
    tags.add('mood');
    tags.add('anxiety');
    emotionScore = 2;
  }
  if (fullText.includes('happy') || fullText.includes('great') || fullText.includes('fun') || fullText.includes('wonderful')) {
    tags.add('mood');
    tags.add('positive');
    emotionScore = 5;
  }
  if (fullText.includes('play') || fullText.includes('friend')) tags.add('social');
  if (fullText.includes('sleep') || fullText.includes('nightmare')) tags.add('sleep');
  if (tags.size === 0) tags.add('general');

  // Generate summaries based on context
  let summary_for_teacher: string;
  let summary_for_doctor: string;

  if (tags.has('health')) {
    summary_for_teacher = `Please be aware of a health note from the parent regarding "${title}". They mentioned: "${description}". Kindly observe for any related symptoms at school.`;
    summary_for_doctor = `Patient's parent reports a health concern: "${title}". Description: "${description}".`;
  } else if (tags.has('anxiety')) {
    summary_for_teacher = `An emotional update about "${title}" was shared. The parent says: "${description}". A calm and reassuring approach would be beneficial today.`;
    summary_for_doctor = `Parent notes potential emotional distress: "${title}". Details: "${description}". This is noted for behavioral and developmental context.`;
  } else if (tags.has('positive')) {
    summary_for_teacher = `Sharing a positive update from home: "${title}". The parent was happy to report that "${description}". This might lead to a great day!`;
    summary_for_doctor = `Parent reports a positive event/mood: "${title}" ("${description}"). Useful as a positive baseline.`;
  } else {
    summary_for_teacher = `A new log from the parent regarding "${title}". Key points: "${description}". Please observe the child and note any relevant behaviors.`;
    summary_for_doctor = `Parental report: "${title}". Details: "${description}".`;
  }

  return {
    summary_for_teacher,
    summary_for_doctor,
    tags: Array.from(tags),
    emotionScore,
  };
};

// This is a mock API function that simulates submitting a new log to a server.
export const submitLog = async (
  logData: {
    title: string;
    description: string;
    childId: string;
    type: LogEntry['type'];
    audio_url?: string;
  }
): Promise<LogEntry> => {
  console.log("Submitting log to Supabase:", logData);
  const { title, description, childId, type, audio_url } = logData;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated to submit log");
  
  // Generate AI-powered summaries, tags and emotion score
  const { summary_for_teacher, summary_for_doctor, tags, emotionScore } = generateAiSummaries(title, description);

  const newLogPayload = {
    child_id: childId,
    user_id: user.id,
    author: 'Parent' as const, // Corrected casing to match DB enum.
    type: type, // Match the DB enum which is lowercase.
    original_entry: { title, description },
    summary_for_teacher,
    summary_for_doctor,
    tags,
    emotion_score: emotionScore,
    audio_url,
  };

  const { data: newLog, error } = await supabase
    .from('logs')
    .insert(newLogPayload)
    .select()
    .single();

  if (error) {
    console.error("Error submitting log:", JSON.stringify(error, null, 2));
    throw error;
  }

  await logAuditEvent('LOG_CREATED', {
    target_entity: 'log',
    target_id: newLog.id,
    details: { child_id: childId, type: type, title: logData.title }
  });
  
  console.log("Supabase responded with new log:", newLog);
  // Cast to unknown first to satisfy TypeScript's stricter type checking
  return newLog as unknown as LogEntry;
};

export const generatePdfDigest = async (childId: string, startDate: Date, endDate: Date): Promise<Blob> => {
    const { data, error } = await supabase.functions.invoke('generate-digest', {
        body: { 
            childId, 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString() 
        },
    });

    if (error) {
        console.error('Error generating PDF digest:', error);
        throw new Error('Failed to generate PDF digest.');
    }
    
    await logAuditEvent('PDF_DIGEST_GENERATED', {
        target_entity: 'child',
        target_id: childId,
        details: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
    });
    
    return data;
};
