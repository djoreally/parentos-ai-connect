
export type LogEntry = {
  id: number;
  timestamp: string;
  author: 'Parent' | 'Teacher' | 'Doctor';
  authorIcon: React.ReactNode;
  original_entry: {
    title: string;
    description: string;
  };
  summary_for_teacher: string;
  summary_for_doctor: string;
  tags: string[];
};
