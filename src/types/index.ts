
export type Child = {
  id: string; // Changed from number
  user_id: string;
  name: string;
  avatar_url: string | null;
  ai_summary: string | null;
  dob: string;
  allergies: string[] | null;
  medications: string[] | null;
  created_at: string;
};

export type LogEntry = {
  id: string; // Changed from number
  child_id: string;
  user_id: string;
  timestamp: string;
  author: 'Parent' | 'Teacher' | 'Doctor';
  type: 'text' | 'voice' | 'document';
  original_entry: {
    title: string;
    description: string;
  };
  summary_for_teacher: string | null; // Can be null
  summary_for_doctor: string | null; // Can be null
  tags: string[] | null; // Can be null
  emotionScore?: number | null; // Can be null
};
