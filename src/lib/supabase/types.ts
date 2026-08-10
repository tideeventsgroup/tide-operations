// Generated from the live schema via the Supabase MCP `generate_typescript_types`
// tool. Regenerate after any migration lands: run the tool again and paste the
// output back into this file (or `supabase gen types typescript` once the
// Supabase CLI is linked locally).

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_primary: boolean
          name: string
          organisation_id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          organisation_id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          organisation_id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_knowledge_references: {
        Row: {
          document_id: string
          knowledge_block_id: string
          section_key: string
        }
        Insert: {
          document_id: string
          knowledge_block_id: string
          section_key: string
        }
        Update: {
          document_id?: string
          knowledge_block_id?: string
          section_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_knowledge_references_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_knowledge_references_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_knowledge_references_knowledge_block_id_fkey"
            columns: ["knowledge_block_id"]
            isOneToOne: false
            referencedRelation: "knowledge_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      document_reference_counters: {
        Row: {
          last_value: number
          template_code: string
          year: number
        }
        Insert: {
          last_value?: number
          template_code: string
          year: number
        }
        Update: {
          last_value?: number
          template_code?: string
          year?: number
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          locked_brand_elements: Json
          name: string
          output_format: Database["public"]["Enums"]["document_output_format"]
          status: Database["public"]["Enums"]["template_status"]
          structure_json: Json
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          locked_brand_elements?: Json
          name: string
          output_format?: Database["public"]["Enums"]["document_output_format"]
          status?: Database["public"]["Enums"]["template_status"]
          structure_json?: Json
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          locked_brand_elements?: Json
          name?: string
          output_format?: Database["public"]["Enums"]["document_output_format"]
          status?: Database["public"]["Enums"]["template_status"]
          structure_json?: Json
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          approved_by: string | null
          content_json: Json
          created_at: string
          created_by: string | null
          document_id: string
          id: string
          pdf_storage_path: string | null
          review_comments: Json
          reviewed_by: string | null
          submitted_by: string | null
          updated_at: string
          version_number: number
        }
        Insert: {
          approved_by?: string | null
          content_json?: Json
          created_at?: string
          created_by?: string | null
          document_id: string
          id?: string
          pdf_storage_path?: string | null
          review_comments?: Json
          reviewed_by?: string | null
          submitted_by?: string | null
          updated_at?: string
          version_number: number
        }
        Update: {
          approved_by?: string | null
          content_json?: Json
          created_at?: string
          created_by?: string | null
          document_id?: string
          id?: string
          pdf_storage_path?: string | null
          review_comments?: Json
          reviewed_by?: string | null
          submitted_by?: string | null
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          approved_at: string | null
          client_visible: boolean
          completion_pct: number
          created_at: string
          created_by: string | null
          current_version_id: string | null
          event_id: string
          id: string
          issued_at: string | null
          owner_id: string | null
          reference: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["document_status"]
          submitted_at: string | null
          template_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          client_visible?: boolean
          completion_pct?: number
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          event_id: string
          id?: string
          issued_at?: string | null
          owner_id?: string | null
          reference?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          submitted_at?: string | null
          template_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          client_visible?: boolean
          completion_pct?: number
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          event_id?: string
          id?: string
          issued_at?: string | null
          owner_id?: string | null
          reference?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          submitted_at?: string | null
          template_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_current_version_id_fkey"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      event_members: {
        Row: {
          created_at: string
          event_id: string
          id: string
          role_on_event: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          role_on_event: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          role_on_event?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_members_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_members_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_stage_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          event_id: string
          from_stage: Database["public"]["Enums"]["event_stage"] | null
          id: string
          to_stage: Database["public"]["Enums"]["event_stage"]
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          event_id: string
          from_stage?: Database["public"]["Enums"]["event_stage"] | null
          id?: string
          to_stage: Database["public"]["Enums"]["event_stage"]
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          event_id?: string
          from_stage?: Database["public"]["Enums"]["event_stage"] | null
          id?: string
          to_stage?: Database["public"]["Enums"]["event_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "event_stage_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_stage_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_stage_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          control_location: string | null
          created_at: string
          created_by: string | null
          end_date: string | null
          event_manager_id: string | null
          expected_attendance: number | null
          financial_value: number | null
          id: string
          key_contacts: Json
          location: string | null
          name: string
          organisation_id: string | null
          safety_manager_id: string | null
          stage: Database["public"]["Enums"]["event_stage"]
          start_date: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          control_location?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          event_manager_id?: string | null
          expected_attendance?: number | null
          financial_value?: number | null
          id?: string
          key_contacts?: Json
          location?: string | null
          name: string
          organisation_id?: string | null
          safety_manager_id?: string | null
          stage?: Database["public"]["Enums"]["event_stage"]
          start_date?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          control_location?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          event_manager_id?: string | null
          expected_attendance?: number | null
          financial_value?: number | null
          id?: string
          key_contacts?: Json
          location?: string | null
          name?: string
          organisation_id?: string | null
          safety_manager_id?: string | null
          stage?: Database["public"]["Enums"]["event_stage"]
          start_date?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_event_manager_id_fkey"
            columns: ["event_manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_safety_manager_id_fkey"
            columns: ["safety_manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_blocks: {
        Row: {
          approval_status: Database["public"]["Enums"]["knowledge_block_approval_status"]
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          review_date: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["knowledge_block_approval_status"]
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          review_date?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["knowledge_block_approval_status"]
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          review_date?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string
          created_by: string | null
          due_date: string | null
          event_id: string
          id: string
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          event_id: string
          id?: string
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          event_id?: string
          id?: string
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          notes: string | null
          portal_access_enabled: boolean
          relationship_status: Database["public"]["Enums"]["relationship_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          portal_access_enabled?: boolean
          relationship_status?: Database["public"]["Enums"]["relationship_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          portal_access_enabled?: boolean
          relationship_status?: Database["public"]["Enums"]["relationship_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organisations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          event_id: string | null
          id: string
          milestone_id: string | null
          owner_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          milestone_id?: string | null
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          milestone_id?: string | null
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          email: string
          full_name: string
          id: string
          organisation_id: string | null
          staff_role: Database["public"]["Enums"]["staff_role"] | null
          updated_at: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          email: string
          full_name?: string
          id: string
          organisation_id?: string | null
          staff_role?: Database["public"]["Enums"]["staff_role"] | null
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          organisation_id?: string | null
          staff_role?: Database["public"]["Enums"]["staff_role"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_open_tasks: {
        Row: {
          due_date: string | null
          event_id: string | null
          event_name: string | null
          id: string | null
          milestone_id: string | null
          owner_id: string | null
          owner_name: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_review_queue: {
        Row: {
          current_version_id: string | null
          event_id: string | null
          event_name: string | null
          id: string | null
          owner_id: string | null
          owner_name: string | null
          reference: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_current_version_id_fkey"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_upcoming_events: {
        Row: {
          end_date: string | null
          id: string | null
          name: string | null
          organisation_id: string | null
          organisation_name: string | null
          stage: Database["public"]["Enums"]["event_stage"] | null
          start_date: string | null
          venue: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      current_profile_account_type: {
        Args: never
        Returns: Database["public"]["Enums"]["account_type"]
      }
      current_profile_organisation_id: { Args: never; Returns: string }
      current_profile_staff_role: {
        Args: never
        Returns: Database["public"]["Enums"]["staff_role"]
      }
      get_dashboard_snapshot: { Args: never; Returns: Json }
      has_event_access: { Args: { p_event_id: string }; Returns: boolean }
      has_event_client_access: {
        Args: { p_event_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_manager_or_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      transition_document_status: {
        Args: {
          p_comment?: string
          p_document_id: string
          p_new_status: Database["public"]["Enums"]["document_status"]
        }
        Returns: {
          approved_at: string | null
          client_visible: boolean
          completion_pct: number
          created_at: string
          created_by: string | null
          current_version_id: string | null
          event_id: string
          id: string
          issued_at: string | null
          owner_id: string | null
          reference: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["document_status"]
          submitted_at: string | null
          template_id: string
          title: string
          updated_at: string
        }
      }
    }
    Enums: {
      account_type: "staff" | "client" | "pending"
      document_output_format: "a4" | "a3" | "a2" | "a6" | "presentation" | "web"
      document_status:
        | "draft"
        | "in_review"
        | "needs_updates"
        | "approved"
        | "issued"
        | "archived"
      event_stage:
        | "enquiry"
        | "proposal"
        | "confirmed"
        | "planning"
        | "live"
        | "complete"
      knowledge_block_approval_status: "draft" | "approved" | "superseded"
      milestone_status: "not_started" | "on_track" | "at_risk" | "complete"
      relationship_status: "prospect" | "active" | "past"
      staff_role: "admin" | "manager" | "control_room" | "field"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "to_do" | "in_progress" | "in_review" | "complete"
      template_status: "draft" | "published" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience aliases for the public schema's Tables/Enums, used across
// server actions and components instead of reaching through Database[...]
// each time.
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      account_type: ["staff", "client", "pending"],
      document_output_format: ["a4", "a3", "a2", "a6", "presentation", "web"],
      document_status: [
        "draft",
        "in_review",
        "needs_updates",
        "approved",
        "issued",
        "archived",
      ],
      event_stage: [
        "enquiry",
        "proposal",
        "confirmed",
        "planning",
        "live",
        "complete",
      ],
      knowledge_block_approval_status: ["draft", "approved", "superseded"],
      milestone_status: ["not_started", "on_track", "at_risk", "complete"],
      relationship_status: ["prospect", "active", "past"],
      staff_role: ["admin", "manager", "control_room", "field"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["to_do", "in_progress", "in_review", "complete"],
      template_status: ["draft", "published", "archived"],
    },
  },
} as const
