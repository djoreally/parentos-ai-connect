
import { LogEntry } from '@/types';

export const mockLogs: LogEntry[] = [
  {
    id: 1,
    timestamp: '2025-06-14T09:15:00Z',
    author: 'Parent',
    original_entry: {
      title: 'Nightmares & Chewing Shirt',
      description: "Leo has been waking up from nightmares almost every night this week. He's also started chewing the collar of his shirts, especially when he seems nervous or is concentrating on something. He told me his tummy hurts sometimes at school.",
    },
    summary_for_teacher: "Leo is experiencing sleep disruptions due to nightmares, which may impact his focus. Please monitor for signs of anxiety, such as oral fixation (chewing on his shirt collar), and note if he complains of stomach aches, particularly during specific activities. A gentle, low-stress environment would be beneficial.",
    summary_for_doctor: "Patient reports new onset of frequent nightmares over the past week, with associated daytime anxiety behaviors including bruxism-like oral fixation (shirt chewing). Patient also reports intermittent abdominal pain, potentially psychosomatic. Assess for generalized anxiety disorder and consider sleep hygiene recommendations.",
    tags: ['sleep', 'behavior', 'anxiety'],
  },
  {
    id: 2,
    timestamp: '2025-06-12T15:30:00Z',
    author: 'Teacher',
    original_entry: {
      title: 'Difficulty with transitions in class',
      description: "Leo had a tough time transitioning from free play to circle time today. He became very upset and refused to join the group for about 10 minutes. He seems more distracted than usual this week.",
    },
    summary_for_teacher: "Continue to provide clear, multi-step warnings before transitions. Consider a visual timer. Observe for patterns in distraction and note activities that hold his focus.",
    summary_for_doctor: "Teacher reports difficulty with classroom transitions and increased distractibility. These behaviors could be linked to reported sleep issues and anxiety. Important context for evaluating developmental or anxiety-related concerns.",
    tags: ['school', 'behavior', 'social'],
  },
];
