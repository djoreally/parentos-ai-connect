
export type Child = {
  id: number;
  name: string;
  avatarUrl: string;
  aiSummary: string;
  dob: string;
  allergies: string[];
  medications: string[];
};

export type LogEntry = {
  id: number;
  timestamp: string;
  author: 'Parent' | 'Teacher' | 'Doctor';
  type: 'text' | 'voice' | 'document';
  original_entry: {
    title: string;
    description: string;
  };
  summary_for_teacher: string;
  summary_for_doctor: string;
  tags: string[];
  emotionScore?: number; // 1-5 scale: 1=very negative, 5=very positive
};
