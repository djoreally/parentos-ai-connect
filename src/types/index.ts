
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'Parent' | 'Teacher' | 'Doctor' | 'Admin' | null;
  created_at?: string;
  updated_at?: string;
}

export interface Child {
  id: string;
  user_id: string;
  name: string;
  dob: string;
  allergies: string[] | null;
  medications: string[] | null;
  avatar_url?: string;
  ai_summary?: string;
  created_at: string;
}

export interface LogEntry {
  id: string;
  child_id: string;
  user_id: string;
  author: 'Parent' | 'Teacher' | 'Doctor';
  type: 'general' | 'health' | 'behavior' | 'milestone' | 'academic' | 'social';
  original_entry: {
    title: string;
    description: string;
  };
  summary_for_teacher?: string;
  summary_for_doctor?: string;
  tags?: string[];
  emotionScore?: number;
  audio_url?: string;
  timestamp: string;
  created_at: string;
}

export interface Message {
  id: string;
  child_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface AppNotification {
  id: string;
  user_id: string;
  child_id: string;
  log_id?: string;
  type: 'new_log' | 'new_message' | 'milestone_update' | 'appointment_reminder';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Milestone {
  id: string;
  age_group: string;
  category: string;
  description: string;
  source?: string;
  created_at: string;
}

export type MilestoneStatus = 'not_yet' | 'emerging' | 'achieved' | 'concern';

export interface ChildMilestoneStatus {
  id: string;
  child_id: string;
  milestone_id: string;
  status: MilestoneStatus;
  notes?: string;
  evidence_url?: string;
  updated_by_user_id: string;
  updated_at: string;
}

export interface ChildMilestoneStatusWithMilestone extends ChildMilestoneStatus {
  milestones: Milestone;
}
