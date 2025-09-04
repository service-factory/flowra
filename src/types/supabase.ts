export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          team_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          team_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          team_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string | null
          filename: string
          id: string
          is_public: boolean | null
          mime_type: string
          original_name: string
          size: number
          task_id: string | null
          thumbnail_url: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filename: string
          id?: string
          is_public?: boolean | null
          mime_type: string
          original_name: string
          size: number
          task_id?: string | null
          thumbnail_url?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filename?: string
          id?: string
          is_public?: boolean | null
          mime_type?: string
          original_name?: string
          size?: number
          task_id?: string | null
          thumbnail_url?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          discord_enabled: boolean | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          discord_enabled?: boolean | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          discord_enabled?: boolean | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_accounts: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          provider: string
          provider_id: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider: string
          provider_id: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider?: string
          provider_id?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          parent_id: string | null
          task_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          parent_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          parent_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "task_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string | null
          depends_on_task_id: string | null
          id: string
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_task_id?: string | null
          id?: string
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_task_id?: string | null
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          action: string
          comment: string | null
          created_at: string | null
          field_name: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          comment?: string | null
          created_at?: string | null
          field_name?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          comment?: string | null
          created_at?: string | null
          field_name?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          tag: string
          task_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          tag: string
          task_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          tag?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_tags_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assignee_id: string | null
          completed_at: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          metadata: Json | null
          position: number | null
          priority: string
          project_id: string | null
          status: string
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          metadata?: Json | null
          position?: number | null
          priority?: string
          project_id?: string | null
          status?: string
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          metadata?: Json | null
          position?: number | null
          priority?: string
          project_id?: string | null
          status?: string
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: string
          team_id: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          role?: string
          team_id?: string | null
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          team_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          permissions: Json | null
          role: string
          team_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          description: string | null
          discord_bot_token_encrypted: string | null
          discord_channel_id: string | null
          discord_guild_id: string | null
          id: string
          is_active: boolean | null
          name: string
          owner_id: string | null
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discord_bot_token_encrypted?: string | null
          discord_channel_id?: string | null
          discord_guild_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          owner_id?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discord_bot_token_encrypted?: string | null
          discord_channel_id?: string | null
          discord_guild_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_id?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          discord_id: string | null
          email: string
          email_verified: boolean | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string
          provider: string
          provider_id: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          discord_id?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          provider: string
          provider_id: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          discord_id?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          provider?: string
          provider_id?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      task_statistics: {
        Row: {
          assignee_id: string | null
          avg_completion_hours: number | null
          completed_tasks: number | null
          in_progress_tasks: number | null
          overdue_tasks: number | null
          pending_tasks: number | null
          team_id: string | null
          total_tasks: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_activity: {
        Row: {
          completed_tasks: number | null
          last_activity: string | null
          overdue_tasks: number | null
          team_id: string | null
          total_tasks: number | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
