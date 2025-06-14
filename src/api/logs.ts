import { LogEntry } from '@/types';
import { mockLogs } from '@/data/mockLogs';

// This function simulates fetching logs from an API.
export const getLogs = async (): Promise<LogEntry[]> => {
  console.log("Fetching logs from mock API...");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return a copy to avoid direct mutation issues with React strict mode
  const sortedLogs = [...mockLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  console.log("Mock API responded with logs:", sortedLogs);
  return sortedLogs;
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
  logData: { title: string; description: string; type?: 'text' | 'voice' | 'document' }
): Promise<LogEntry> => {
  console.log("Submitting log to mock API:", logData);

  const { title, description } = logData;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate AI-powered summaries, tags and emotion score
  const { summary_for_teacher, summary_for_doctor, tags, emotionScore } = generateAiSummaries(title, description);

  const newLog: LogEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    author: 'Parent', // For now, we assume the parent is always the author of new logs.
    type: logData.type || 'text',
    original_entry: {
      title: title,
      description: description,
    },
    summary_for_teacher,
    summary_for_doctor,
    tags,
    emotionScore,
  };
  
  console.log("Mock API responded with new log:", newLog);
  // We'll prepend to the mockLogs array to simulate a database update.
  // In a real app, you wouldn't do this on the client.
  mockLogs.unshift(newLog); 
  return newLog;
};
