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
      applications: {
        Row: {
          applied_at: string
          cover_letter: string | null
          cv_file_url: string | null
          id: string
          job_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          cv_file_url?: string | null
          id?: string
          job_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          cv_file_url?: string | null
          id?: string
          job_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      employers: {
        Row: {
          company_address: string | null
          company_description: string | null
          company_logo_url: string | null
          company_name: string
          company_size: string | null
          company_website: string | null
          created_at: string
          email: string
          id: string
          industry: string | null
          is_verified: boolean | null
          phone_number: string | null
          telegram_user_id: number | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          company_address?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_name: string
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          phone_number?: string | null
          telegram_user_id?: number | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          company_address?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_name?: string
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          phone_number?: string | null
          telegram_user_id?: number | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      featured_job_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          currency: string
          employer_id: string
          id: string
          job_id: string
          payment_screenshot_url: string | null
          processed_at: string | null
          processed_by: string | null
          status: string
          submitted_at: string | null
          transaction_reference: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          currency?: string
          employer_id: string
          id?: string
          job_id: string
          payment_screenshot_url?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          submitted_at?: string | null
          transaction_reference: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          currency?: string
          employer_id?: string
          id?: string
          job_id?: string
          payment_screenshot_url?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          submitted_at?: string | null
          transaction_reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_job_requests_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_job_requests_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_email: string
          benefits: string | null
          category: string
          city: string
          company_culture: string | null
          created_at: string
          deadline: string
          description: string
          education_level: string | null
          employer_id: string
          featured_until: string | null
          freelance_until: string | null
          id: string
          is_featured: boolean | null
          is_freelance: boolean | null
          job_type: string | null
          posted_date: string
          requirements: string
          salary_range: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          application_email: string
          benefits?: string | null
          category: string
          city: string
          company_culture?: string | null
          created_at?: string
          deadline: string
          description: string
          education_level?: string | null
          employer_id: string
          featured_until?: string | null
          freelance_until?: string | null
          id?: string
          is_featured?: boolean | null
          is_freelance?: boolean | null
          job_type?: string | null
          posted_date?: string
          requirements: string
          salary_range?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          application_email?: string
          benefits?: string | null
          category?: string
          city?: string
          company_culture?: string | null
          created_at?: string
          deadline?: string
          description?: string
          education_level?: string | null
          employer_id?: string
          featured_until?: string | null
          freelance_until?: string | null
          id?: string
          is_featured?: boolean | null
          is_freelance?: boolean | null
          job_type?: string | null
          posted_date?: string
          requirements?: string
          salary_range?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          job_id: string
          message: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          job_id: string
          message: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          job_id?: string
          message?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          cv_url: string | null
          employer_id: string | null
          experience_years: number | null
          full_name: string | null
          id: string
          is_suspended: boolean | null
          location: string | null
          phone: string | null
          skills: string[] | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          telegram_user_id: number | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          cv_url?: string | null
          employer_id?: string | null
          experience_years?: number | null
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          location?: string | null
          phone?: string | null
          skills?: string[] | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          telegram_user_id?: number | null
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          cv_url?: string | null
          employer_id?: string | null
          experience_years?: number | null
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          location?: string | null
          phone?: string | null
          skills?: string[] | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          telegram_user_id?: number | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_freelance_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      suspend_user: {
        Args: { admin_email: string; reason: string; target_user_id: string }
        Returns: undefined
      }
      unsuspend_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      unverify_company: {
        Args: { target_employer_id: string }
        Returns: undefined
      }
      verify_company: {
        Args: { admin_email: string; target_employer_id: string }
        Returns: undefined
      }
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
