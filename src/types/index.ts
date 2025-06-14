
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
  original_entry: {
    title: string;
    description: string;
  };
  summary_for_teacher: string;
  summary_for_doctor: string;
  tags: string[];
};
