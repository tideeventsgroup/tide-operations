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
      client_requests: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          fulfilled_at: string | null
          fulfilled_by: string | null
          id: string
          raised_by: string | null
          response_note: string | null
          status: Database["public"]["Enums"]["client_request_status"]
          title: string
          type: Database["public"]["Enums"]["client_request_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          raised_by?: string | null
          response_note?: string | null
          status?: Database["public"]["Enums"]["client_request_status"]
          title: string
          type: Database["public"]["Enums"]["client_request_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          raised_by?: string | null
          response_note?: string | null
          status?: Database["public"]["Enums"]["client_request_status"]
          title?: string
          type?: Database["public"]["Enums"]["client_request_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_requests_fulfilled_by_fkey"
            columns: ["fulfilled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_requests_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      decisions: {
        Row: {
          created_at: string
          decided_by: string | null
          decision_text: string
          event_id: string
          id: string
          incident_id: string | null
          rationale: string | null
        }
        Insert: {
          created_at?: string
          decided_by?: string | null
          decision_text: string
          event_id: string
          id?: string
          incident_id?: string | null
          rationale?: string | null
        }
        Update: {
          created_at?: string
          decided_by?: string | null
          decision_text?: string
          event_id?: string
          id?: string
          incident_id?: string | null
          rationale?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
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
      document_types: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["template_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["template_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["template_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_types_created_by_fkey"
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
          created_at: string
          created_by: string | null
          document_id: string
          file_name: string
          file_size: number | null
          file_storage_path: string
          id: string
          mime_type: string | null
          review_comments: Json
          reviewed_by: string | null
          submitted_by: string | null
          updated_at: string
          version_number: number
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          document_id: string
          file_name: string
          file_size?: number | null
          file_storage_path: string
          id?: string
          mime_type?: string | null
          review_comments?: Json
          reviewed_by?: string | null
          submitted_by?: string | null
          updated_at?: string
          version_number: number
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string
          file_name?: string
          file_size?: number | null
          file_storage_path?: string
          id?: string
          mime_type?: string | null
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
          created_at: string
          created_by: string | null
          current_version_id: string | null
          document_type_id: string
          event_id: string
          id: string
          issued_at: string | null
          owner_id: string | null
          reference: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["document_status"]
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          document_type_id: string
          event_id: string
          id?: string
          issued_at?: string | null
          owner_id?: string | null
          reference?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          document_type_id?: string
          event_id?: string
          id?: string
          issued_at?: string | null
          owner_id?: string | null
          reference?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          submitted_at?: string | null
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
            foreignKeyName: "documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
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
      event_messages: {
        Row: {
          body: string
          created_at: string
          event_id: string
          id: string
          sender_id: string | null
          visible_to_client: boolean
        }
        Insert: {
          body: string
          created_at?: string
          event_id: string
          id?: string
          sender_id?: string | null
          visible_to_client?: boolean
        }
        Update: {
          body?: string
          created_at?: string
          event_id?: string
          id?: string
          sender_id?: string | null
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "event_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_messages_sender_id_fkey"
            columns: ["sender_id"]
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
      incident_log_entries: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          entry_type: Database["public"]["Enums"]["incident_log_entry_type"]
          id: string
          incident_id: string
          supersedes_entry_id: string | null
          time: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          entry_type?: Database["public"]["Enums"]["incident_log_entry_type"]
          id?: string
          incident_id: string
          supersedes_entry_id?: string | null
          time?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          entry_type?: Database["public"]["Enums"]["incident_log_entry_type"]
          id?: string
          incident_id?: string
          supersedes_entry_id?: string | null
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_log_entries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_log_entries_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_log_entries_supersedes_entry_id_fkey"
            columns: ["supersedes_entry_id"]
            isOneToOne: false
            referencedRelation: "incident_log_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_number_counters: {
        Row: {
          event_id: string
          last_value: number
        }
        Insert: {
          event_id: string
          last_value?: number
        }
        Update: {
          event_id?: string
          last_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "incident_number_counters_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_number_counters_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          casualty_count: number
          category: string | null
          created_at: string
          created_by: string | null
          event_id: string
          id: string
          incident_commander_id: string | null
          incident_number: string | null
          location: string | null
          reporter_id: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          summary: string
          time_reported: string
          updated_at: string
        }
        Insert: {
          casualty_count?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          event_id: string
          id?: string
          incident_commander_id?: string | null
          incident_number?: string | null
          location?: string | null
          reporter_id?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          summary: string
          time_reported?: string
          updated_at?: string
        }
        Update: {
          casualty_count?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string
          id?: string
          incident_commander_id?: string | null
          incident_number?: string | null
          location?: string | null
          reporter_id?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          summary?: string
          time_reported?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_incident_commander_id_fkey"
            columns: ["incident_commander_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reporter_id_fkey"
            columns: ["reporter_id"]
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
      methane_messages: {
        Row: {
          access: string | null
          casualty_numbers: Json
          created_at: string
          emergency_services: Json
          exact_location: string | null
          hazards: string | null
          id: string
          incident_id: string
          incident_type: string | null
          major_incident_declared: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          access?: string | null
          casualty_numbers?: Json
          created_at?: string
          emergency_services?: Json
          exact_location?: string | null
          hazards?: string | null
          id?: string
          incident_id: string
          incident_type?: string | null
          major_incident_declared?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          access?: string | null
          casualty_numbers?: Json
          created_at?: string
          emergency_services?: Json
          exact_location?: string | null
          hazards?: string | null
          id?: string
          incident_id?: string
          incident_type?: string | null
          major_incident_declared?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "methane_messages_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: true
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "methane_messages_updated_by_fkey"
            columns: ["updated_by"]
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
      resources: {
        Row: {
          call_sign: string | null
          created_at: string
          created_by: string | null
          event_id: string
          id: string
          location: string | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          call_sign?: string | null
          created_at?: string
          created_by?: string | null
          event_id: string
          id?: string
          location?: string | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          call_sign?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string
          id?: string
          location?: string | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
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
      welfare_records: {
        Row: {
          casualty_status: string | null
          created_at: string
          created_by: string | null
          event_id: string
          id: string
          incident_id: string | null
          medical_notes: string | null
          person_details: Json
          updated_at: string
        }
        Insert: {
          casualty_status?: string | null
          created_at?: string
          created_by?: string | null
          event_id: string
          id?: string
          incident_id?: string | null
          medical_notes?: string | null
          person_details?: Json
          updated_at?: string
        }
        Update: {
          casualty_status?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string
          id?: string
          incident_id?: string | null
          medical_notes?: string | null
          person_details?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "welfare_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "welfare_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "welfare_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "welfare_records_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
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
      is_incident_manager: { Args: never; Returns: boolean }
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
          created_at: string
          created_by: string | null
          current_version_id: string | null
          document_type_id: string
          event_id: string
          id: string
          issued_at: string | null
          owner_id: string | null
          reference: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["document_status"]
          submitted_at: string | null
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "documents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      account_type: "staff" | "client" | "pending"
      client_request_status: "open" | "fulfilled"
      client_request_type: "information" | "file_upload"
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
      incident_log_entry_type: "update" | "decision" | "action" | "correction"
      incident_severity: "minor" | "moderate" | "serious" | "critical"
      incident_status: "open" | "monitoring" | "resolved" | "closed"
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
    Enums: {
      account_type: ["staff", "client", "pending"],
      client_request_status: ["open", "fulfilled"],
      client_request_type: ["information", "file_upload"],
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
      incident_log_entry_type: ["update", "decision", "action", "correction"],
      incident_severity: ["minor", "moderate", "serious", "critical"],
      incident_status: ["open", "monitoring", "resolved", "closed"],
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
