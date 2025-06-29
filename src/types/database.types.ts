
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
      admin_users: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          updated_at: string
          used_count: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string
          used_count?: number | null
          valid_from?: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string
          used_count?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          document_type: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          registration_id: string | null
          uploaded_at: string
          verification_notes: string | null
          verification_status: string
        }
        Insert: {
          document_type: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          registration_id?: string | null
          uploaded_at?: string
          verification_notes?: string | null
          verification_status?: string
        }
        Update: {
          document_type?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          registration_id?: string | null
          uploaded_at?: string
          verification_notes?: string | null
          verification_status?: string
        }
        Relationships: []
      }
      file_metadata: {
        Row: {
          created_at: string
          id: string
          mime_type: string
          name: string
          reference_id: string | null
          reference_type: string | null
          size_bytes: number
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type: string
          name: string
          reference_id?: string | null
          reference_type?: string | null
          size_bytes: number
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string
          name?: string
          reference_id?: string | null
          reference_type?: string | null
          size_bytes?: number
          uploaded_by?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          payment_method: string
          payment_screenshot_url: string | null
          payer_name: string
          phone_number: string
          registration_id: string | null
          status: string
          transaction_id: string | null
          verified_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          payment_screenshot_url?: string | null
          payer_name: string
          phone_number: string
          registration_id?: string | null
          status?: string
          transaction_id?: string | null
          verified_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          payment_screenshot_url?: string | null
          payer_name?: string
          phone_number?: string
          registration_id?: string | null
          status?: string
          transaction_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          admin_notes: string | null
          center_name: string | null
          center_number: string | null
          cin: string
          created_at: string
          date_of_birth: string
          department: string
          document_verification_status: string
          exam_level: string
          full_name: string
          gender: string
          id: string
          location: string
          payment_status: string
          services: Json
          subjects_and_grades: Json
          total_cost: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          center_name?: string | null
          center_number?: string | null
          cin: string
          created_at?: string
          date_of_birth: string
          department: string
          document_verification_status?: string
          exam_level: string
          full_name: string
          gender: string
          id?: string
          location: string
          payment_status?: string
          services?: Json
          subjects_and_grades?: Json
          total_cost?: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          center_name?: string | null
          center_number?: string | null
          cin?: string
          created_at?: string
          date_of_birth?: string
          department?: string
          document_verification_status?: string
          exam_level?: string
          full_name?: string
          gender?: string
          id?: string
          location?: string
          payment_status?: string
          services?: Json
          subjects_and_grades?: Json
          total_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          role_name: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
