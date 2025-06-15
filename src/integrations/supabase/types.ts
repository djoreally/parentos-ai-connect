export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointment_participants: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["participant_status"]
          user_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["participant_status"]
          user_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["participant_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_participants_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          child_id: string
          created_at: string
          description: string | null
          end_time: string
          google_meet_link: string | null
          id: string
          location: string | null
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          organizer_user_id: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          title: string
        }
        Insert: {
          child_id: string
          created_at?: string
          description?: string | null
          end_time: string
          google_meet_link?: string | null
          id?: string
          location?: string | null
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          organizer_user_id: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          title: string
        }
        Update: {
          child_id?: string
          created_at?: string
          description?: string | null
          end_time?: string
          google_meet_link?: string | null
          id?: string
          location?: string | null
          meeting_type?: Database["public"]["Enums"]["meeting_type"]
          organizer_user_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_entity: string | null
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_entity?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_entity?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_access: {
        Row: {
          child_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_access_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      child_milestone_status: {
        Row: {
          child_id: string
          evidence_url: string | null
          id: string
          milestone_id: string
          notes: string | null
          status: Database["public"]["Enums"]["milestone_status"]
          updated_at: string
          updated_by_user_id: string
        }
        Insert: {
          child_id: string
          evidence_url?: string | null
          id?: string
          milestone_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["milestone_status"]
          updated_at?: string
          updated_by_user_id: string
        }
        Update: {
          child_id?: string
          evidence_url?: string | null
          id?: string
          milestone_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["milestone_status"]
          updated_at?: string
          updated_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_milestone_status_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_milestone_status_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          ai_summary: string | null
          allergies: string[] | null
          avatar_url: string | null
          created_at: string
          dob: string
          id: string
          medications: string[] | null
          name: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          allergies?: string[] | null
          avatar_url?: string | null
          created_at?: string
          dob: string
          id?: string
          medications?: string[] | null
          name: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          allergies?: string[] | null
          avatar_url?: string | null
          created_at?: string
          dob?: string
          id?: string
          medications?: string[] | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          child_id: string
          created_at: string
          expires_at: string
          id: string
          invitee_email: string
          parent_user_id: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          child_id: string
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email: string
          parent_user_id: string
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Update: {
          child_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string
          parent_user_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          audio_url: string | null
          author: Database["public"]["Enums"]["author_role"]
          child_id: string
          created_at: string
          emotion_score: number | null
          id: string
          original_entry: Json
          summary_for_doctor: string | null
          summary_for_teacher: string | null
          tags: string[] | null
          timestamp: string
          type: Database["public"]["Enums"]["log_type"]
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          author: Database["public"]["Enums"]["author_role"]
          child_id: string
          created_at?: string
          emotion_score?: number | null
          id?: string
          original_entry: Json
          summary_for_doctor?: string | null
          summary_for_teacher?: string | null
          tags?: string[] | null
          timestamp?: string
          type: Database["public"]["Enums"]["log_type"]
          user_id: string
        }
        Update: {
          audio_url?: string | null
          author?: Database["public"]["Enums"]["author_role"]
          child_id?: string
          created_at?: string
          emotion_score?: number | null
          id?: string
          original_entry?: Json
          summary_for_doctor?: string | null
          summary_for_teacher?: string | null
          tags?: string[] | null
          timestamp?: string
          type?: Database["public"]["Enums"]["log_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          child_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          child_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          child_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          age_group: string
          category: string
          created_at: string
          description: string
          id: string
          source: string | null
        }
        Insert: {
          age_group: string
          category: string
          created_at?: string
          description: string
          id?: string
          source?: string | null
        }
        Update: {
          age_group?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          child_id: string
          created_at: string
          id: string
          is_read: boolean
          log_id: string | null
          message: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          log_id?: string | null
          message: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          log_id?: string | null
          message?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_child_parent: {
        Args: { child_id_to_check: string }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status: "scheduled" | "cancelled" | "completed"
      author_role: "Parent" | "Teacher" | "Doctor"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
      log_type: "text" | "voice" | "document"
      meeting_type: "online" | "in-person"
      milestone_status: "not_yet" | "in_progress" | "achieved"
      notification_type: "new_log" | "team_invite" | "alert" | "new_message"
      participant_status: "pending" | "accepted" | "declined" | "tentative"
      user_role: "Parent" | "Teacher" | "Doctor" | "Admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: ["scheduled", "cancelled", "completed"],
      author_role: ["Parent", "Teacher", "Doctor"],
      invitation_status: ["pending", "accepted", "expired", "revoked"],
      log_type: ["text", "voice", "document"],
      meeting_type: ["online", "in-person"],
      milestone_status: ["not_yet", "in_progress", "achieved"],
      notification_type: ["new_log", "team_invite", "alert", "new_message"],
      participant_status: ["pending", "accepted", "declined", "tentative"],
      user_role: ["Parent", "Teacher", "Doctor", "Admin"],
    },
  },
} as const
