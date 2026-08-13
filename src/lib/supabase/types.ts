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
      business_opportunities: {
        Row: {
          created_at: string
          created_by: string | null
          estimated_value: number
          event_id: string | null
          expected_close_date: string | null
          id: string
          lost_reason: string | null
          name: string
          notes: string | null
          opportunity_reference: string
          organisation_id: string
          owner_id: string | null
          probability: number
          source: string | null
          stage: Database["public"]["Enums"]["opportunity_stage"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          estimated_value?: number
          event_id?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          name: string
          notes?: string | null
          opportunity_reference?: string
          organisation_id: string
          owner_id?: string | null
          probability?: number
          source?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          estimated_value?: number
          event_id?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          name?: string
          notes?: string | null
          opportunity_reference?: string
          organisation_id?: string
          owner_id?: string | null
          probability?: number
          source?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_opportunities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_opportunities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_opportunities_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_opportunities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_services: {
        Row: {
          active: boolean
          category: string
          code: string
          created_at: string
          created_by: string | null
          default_unit_price: number
          description: string
          id: string
          name: string
          tax_rate: number
          unit_label: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          code: string
          created_at?: string
          created_by?: string | null
          default_unit_price?: number
          description: string
          id?: string
          name: string
          tax_rate?: number
          unit_label?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          code?: string
          created_at?: string
          created_by?: string | null
          default_unit_price?: number
          description?: string
          id?: string
          name?: string
          tax_rate?: number
          unit_label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      commercial_activity: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          from_status: string | null
          id: string
          note: string | null
          to_status: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_activity_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_terms_templates: {
        Row: {
          active: boolean
          body: string
          created_at: string
          created_by: string | null
          document_kind: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          created_by?: string | null
          document_kind?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          created_by?: string | null
          document_kind?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_terms_templates_created_by_fkey"
            columns: ["created_by"]
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
          implemented_at: string | null
          incident_id: string | null
          outcome: string | null
          rationale: string | null
        }
        Insert: {
          created_at?: string
          decided_by?: string | null
          decision_text: string
          event_id: string
          id?: string
          implemented_at?: string | null
          incident_id?: string | null
          outcome?: string | null
          rationale?: string | null
        }
        Update: {
          created_at?: string
          decided_by?: string | null
          decision_text?: string
          event_id?: string
          id?: string
          implemented_at?: string | null
          incident_id?: string | null
          outcome?: string | null
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
      event_control_log_entries: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          entry_type: Database["public"]["Enums"]["incident_log_entry_type"]
          event_id: string
          id: string
          incident_id: string | null
          supersedes_entry_id: string | null
          time: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          entry_type?: Database["public"]["Enums"]["incident_log_entry_type"]
          event_id: string
          id?: string
          incident_id?: string | null
          supersedes_entry_id?: string | null
          time?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          entry_type?: Database["public"]["Enums"]["incident_log_entry_type"]
          event_id?: string
          id?: string
          incident_id?: string | null
          supersedes_entry_id?: string | null
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_control_log_entries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_control_log_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_control_log_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_control_log_entries_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_control_log_entries_supersedes_entry_id_fkey"
            columns: ["supersedes_entry_id"]
            isOneToOne: false
            referencedRelation: "event_control_log_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      event_control_roles: {
        Row: {
          active: boolean
          call_sign: string | null
          contact_details: string | null
          created_at: string
          created_by: string | null
          event_id: string
          id: string
          role_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          call_sign?: string | null
          contact_details?: string | null
          created_at?: string
          created_by?: string | null
          event_id: string
          id?: string
          role_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          call_sign?: string | null
          contact_details?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string
          id?: string
          role_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_control_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_control_roles_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_control_roles_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_control_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_control_sessions: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          event_id: string
          handover_notes: string | null
          id: string
          opened_at: string | null
          opened_by: string | null
          status: Database["public"]["Enums"]["control_session_status"]
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          event_id: string
          handover_notes?: string | null
          id?: string
          opened_at?: string | null
          opened_by?: string | null
          status?: Database["public"]["Enums"]["control_session_status"]
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          event_id?: string
          handover_notes?: string | null
          id?: string
          opened_at?: string | null
          opened_by?: string | null
          status?: Database["public"]["Enums"]["control_session_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_control_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_control_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_control_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_control_sessions_opened_by_fkey"
            columns: ["opened_by"]
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
          event_reference: string
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
          event_reference?: string
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
          event_reference?: string
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
      incident_actions: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          completion_note: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          event_id: string
          id: string
          incident_id: string | null
          priority: Database["public"]["Enums"]["incident_action_priority"]
          status: Database["public"]["Enums"]["incident_action_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_note?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          event_id: string
          id?: string
          incident_id?: string | null
          priority?: Database["public"]["Enums"]["incident_action_priority"]
          status?: Database["public"]["Enums"]["incident_action_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_note?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          event_id?: string
          id?: string
          incident_id?: string | null
          priority?: Database["public"]["Enums"]["incident_action_priority"]
          status?: Database["public"]["Enums"]["incident_action_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_actions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_actions_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_actions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_actions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_actions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_actions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_attachments: {
        Row: {
          caption: string | null
          captured_at: string | null
          created_at: string
          event_id: string
          evidence_type: string
          file_name: string
          file_size: number
          file_storage_path: string
          id: string
          incident_id: string
          mime_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          captured_at?: string | null
          created_at?: string
          event_id: string
          evidence_type?: string
          file_name: string
          file_size: number
          file_storage_path: string
          id?: string
          incident_id: string
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          captured_at?: string | null
          created_at?: string
          event_id?: string
          evidence_type?: string
          file_name?: string
          file_size?: number
          file_storage_path?: string
          id?: string
          incident_id?: string
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_attachments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_attachments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_attachments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
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
          closed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          emergency_services_call_time: string | null
          emergency_services_called: boolean
          event_id: string
          hazard_reference: string | null
          id: string
          incident_commander_id: string | null
          incident_number: string | null
          last_activity_at: string
          location: string | null
          reported_via: string | null
          reporter_id: string | null
          resolution_summary: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          summary: string
          time_reported: string
          updated_at: string
        }
        Insert: {
          casualty_count?: number
          category?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          emergency_services_call_time?: string | null
          emergency_services_called?: boolean
          event_id: string
          hazard_reference?: string | null
          id?: string
          incident_commander_id?: string | null
          incident_number?: string | null
          last_activity_at?: string
          location?: string | null
          reported_via?: string | null
          reporter_id?: string | null
          resolution_summary?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          summary: string
          time_reported?: string
          updated_at?: string
        }
        Update: {
          casualty_count?: number
          category?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          emergency_services_call_time?: string | null
          emergency_services_called?: boolean
          event_id?: string
          hazard_reference?: string | null
          id?: string
          incident_commander_id?: string | null
          incident_number?: string | null
          last_activity_at?: string
          location?: string | null
          reported_via?: string | null
          reporter_id?: string | null
          resolution_summary?: string | null
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
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          position: number
          quantity: number
          tax_rate: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          position?: number
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          position?: number
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          balance_due: number
          client_visible: boolean
          created_at: string
          created_by: string | null
          currency: string
          due_date: string | null
          event_id: string | null
          id: string
          invoice_reference: string
          issue_date: string
          notes: string | null
          organisation_id: string
          paid_at: string | null
          payment_terms: string | null
          quote_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_total: number
          title: string
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          balance_due?: number
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          currency?: string
          due_date?: string | null
          event_id?: string | null
          id?: string
          invoice_reference?: string
          issue_date?: string
          notes?: string | null
          organisation_id: string
          paid_at?: string | null
          payment_terms?: string | null
          quote_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_total?: number
          title: string
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          balance_due?: number
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          currency?: string
          due_date?: string | null
          event_id?: string | null
          id?: string
          invoice_reference?: string
          issue_date?: string
          notes?: string | null
          organisation_id?: string
          paid_at?: string | null
          payment_terms?: string | null
          quote_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_total?: number
          title?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
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
      methane_message_versions: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          incident_id: string
          methane_message_id: string
          revision: number
          snapshot: Json
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          incident_id: string
          methane_message_id: string
          revision: number
          snapshot: Json
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          incident_id?: string
          methane_message_id?: string
          revision?: number
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "methane_message_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "methane_message_versions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "methane_message_versions_methane_message_id_fkey"
            columns: ["methane_message_id"]
            isOneToOne: false
            referencedRelation: "methane_messages"
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
          receiving_service: string | null
          sent_at: string | null
          sent_by: string | null
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
          receiving_service?: string | null
          sent_at?: string | null
          sent_by?: string | null
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
          receiving_service?: string | null
          sent_at?: string | null
          sent_by?: string | null
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
            foreignKeyName: "methane_messages_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      operational_locations: {
        Row: {
          access_notes: string | null
          active: boolean
          created_at: string
          created_by: string | null
          description: string | null
          event_id: string
          grid_reference: string | null
          id: string
          location_type: string
          name: string
          updated_at: string
          what3words: string | null
        }
        Insert: {
          access_notes?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_id: string
          grid_reference?: string | null
          id?: string
          location_type: string
          name: string
          updated_at?: string
          what3words?: string | null
        }
        Update: {
          access_notes?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_id?: string
          grid_reference?: string | null
          id?: string
          location_type?: string
          name?: string
          updated_at?: string
          what3words?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operational_locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_locations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_locations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          client_reference: string
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
          client_reference?: string
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
          client_reference?: string
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
      payments: {
        Row: {
          amount: number
          created_at: string
          external_reference: string | null
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_on: string
          payment_reference: string
          recorded_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          external_reference?: string | null
          id?: string
          invoice_id: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_on?: string
          payment_reference?: string
          recorded_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          external_reference?: string | null
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_on?: string
          payment_reference?: string
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_services: {
        Row: {
          created_at: string
          description: string
          id: string
          position: number
          proposal_id: string
          service_id: string | null
          service_name: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          position?: number
          proposal_id: string
          service_id?: string | null
          service_name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          position?: number
          proposal_id?: string
          service_id?: string | null
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_services_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_services"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          accepted_by_name: string | null
          assumptions: string | null
          client_visible: boolean
          created_at: string
          created_by: string | null
          document_id: string | null
          event_id: string | null
          id: string
          opportunity_id: string | null
          organisation_id: string
          proposal_reference: string
          quote_id: string | null
          scope: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          summary: string | null
          terms: string | null
          title: string
          updated_at: string
          valid_until: string | null
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_name?: string | null
          assumptions?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          event_id?: string | null
          id?: string
          opportunity_id?: string | null
          organisation_id: string
          proposal_reference?: string
          quote_id?: string | null
          scope?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          summary?: string | null
          terms?: string | null
          title: string
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by_name?: string | null
          assumptions?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          event_id?: string | null
          id?: string
          opportunity_id?: string | null
          organisation_id?: string
          proposal_reference?: string
          quote_id?: string | null
          scope?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          summary?: string | null
          terms?: string | null
          title?: string
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "business_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string
          id: string
          position: number
          quantity: number
          quote_id: string
          tax_rate: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          position?: number
          quantity?: number
          quote_id: string
          tax_rate?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          position?: number
          quantity?: number
          quote_id?: string
          tax_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          accepted_by_name: string | null
          client_visible: boolean
          created_at: string
          created_by: string | null
          currency: string
          event_id: string | null
          id: string
          issue_date: string
          notes: string | null
          opportunity_id: string | null
          organisation_id: string
          quote_reference: string
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          tax_total: number
          terms: string | null
          title: string
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_name?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          currency?: string
          event_id?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          opportunity_id?: string | null
          organisation_id: string
          quote_reference?: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_total?: number
          terms?: string | null
          title: string
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by_name?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          currency?: string
          event_id?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          opportunity_id?: string | null
          organisation_id?: string
          quote_reference?: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_total?: number
          terms?: string | null
          title?: string
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "business_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_channels: {
        Row: {
          active: boolean
          channel_name: string
          created_at: string
          created_by: string | null
          event_id: string
          frequency_or_talkgroup: string | null
          id: string
          notes: string | null
          purpose: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          channel_name: string
          created_at?: string
          created_by?: string | null
          event_id: string
          frequency_or_talkgroup?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          channel_name?: string
          created_at?: string
          created_by?: string | null
          event_id?: string
          frequency_or_talkgroup?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "radio_channels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radio_channels_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radio_channels_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_messages: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          direction: Database["public"]["Enums"]["radio_message_direction"]
          event_id: string
          from_call_sign: string | null
          id: string
          incident_id: string | null
          radio_channel_id: string | null
          supersedes_entry_id: string | null
          time: string
          to_call_sign: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          direction?: Database["public"]["Enums"]["radio_message_direction"]
          event_id: string
          from_call_sign?: string | null
          id?: string
          incident_id?: string | null
          radio_channel_id?: string | null
          supersedes_entry_id?: string | null
          time?: string
          to_call_sign?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["radio_message_direction"]
          event_id?: string
          from_call_sign?: string | null
          id?: string
          incident_id?: string | null
          radio_channel_id?: string | null
          supersedes_entry_id?: string | null
          time?: string
          to_call_sign?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "radio_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radio_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radio_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radio_messages_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radio_messages_radio_channel_id_fkey"
            columns: ["radio_channel_id"]
            isOneToOne: false
            referencedRelation: "radio_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radio_messages_supersedes_entry_id_fkey"
            columns: ["supersedes_entry_id"]
            isOneToOne: false
            referencedRelation: "radio_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          assigned_to: string | null
          call_sign: string | null
          contact_details: string | null
          created_at: string
          created_by: string | null
          deployed_at: string | null
          event_id: string
          id: string
          incident_id: string | null
          location: string | null
          notes: string | null
          quantity: number
          released_at: string | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          call_sign?: string | null
          contact_details?: string | null
          created_at?: string
          created_by?: string | null
          deployed_at?: string | null
          event_id: string
          id?: string
          incident_id?: string | null
          location?: string | null
          notes?: string | null
          quantity?: number
          released_at?: string | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          call_sign?: string | null
          contact_details?: string | null
          created_at?: string
          created_by?: string | null
          deployed_at?: string | null
          event_id?: string
          id?: string
          incident_id?: string | null
          location?: string | null
          notes?: string | null
          quantity?: number
          released_at?: string | null
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
          {
            foreignKeyName: "resources_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          accounts_email: string | null
          brand_accent: string
          brand_primary: string
          company_name: string
          created_at: string
          dark_logo_url: string
          default_currency: string
          default_vat_rate: number
          id: string
          invoice_due_days: number
          legal_name: string
          light_logo_url: string
          operations_email: string
          phone: string | null
          portal_welcome_message: string
          postal_address: string | null
          quote_valid_days: number
          registration_number: string | null
          updated_at: string
          updated_by: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          accounts_email?: string | null
          brand_accent?: string
          brand_primary?: string
          company_name?: string
          created_at?: string
          dark_logo_url?: string
          default_currency?: string
          default_vat_rate?: number
          id?: string
          invoice_due_days?: number
          legal_name?: string
          light_logo_url?: string
          operations_email?: string
          phone?: string | null
          portal_welcome_message?: string
          postal_address?: string | null
          quote_valid_days?: number
          registration_number?: string | null
          updated_at?: string
          updated_by?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          accounts_email?: string | null
          brand_accent?: string
          brand_primary?: string
          company_name?: string
          created_at?: string
          dark_logo_url?: string
          default_currency?: string
          default_vat_rate?: number
          id?: string
          invoice_due_days?: number
          legal_name?: string
          light_logo_url?: string
          operations_email?: string
          phone?: string | null
          portal_welcome_message?: string
          postal_address?: string | null
          quote_valid_days?: number
          registration_number?: string | null
          updated_at?: string
          updated_by?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
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
      welfare_records: {
        Row: {
          age_band: string | null
          casualty_reference: string | null
          casualty_status: string | null
          created_at: string
          created_by: string | null
          disposition: string | null
          event_id: string
          handed_over_to: string | null
          handover_time: string | null
          id: string
          incident_id: string | null
          medical_notes: string | null
          next_of_kin_contacted: boolean
          person_details: Json
          triage_category: string | null
          updated_at: string
        }
        Insert: {
          age_band?: string | null
          casualty_reference?: string | null
          casualty_status?: string | null
          created_at?: string
          created_by?: string | null
          disposition?: string | null
          event_id: string
          handed_over_to?: string | null
          handover_time?: string | null
          id?: string
          incident_id?: string | null
          medical_notes?: string | null
          next_of_kin_contacted?: boolean
          person_details?: Json
          triage_category?: string | null
          updated_at?: string
        }
        Update: {
          age_band?: string | null
          casualty_reference?: string | null
          casualty_status?: string | null
          created_at?: string
          created_by?: string | null
          disposition?: string | null
          event_id?: string
          handed_over_to?: string | null
          handover_time?: string | null
          id?: string
          incident_id?: string | null
          medical_notes?: string | null
          next_of_kin_contacted?: boolean
          person_details?: Json
          triage_category?: string | null
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
      v_commercial_overview: {
        Row: {
          outstanding_invoices: number | null
          overdue_invoices: number | null
          quotes_awaiting_decision: number | null
          weighted_pipeline: number | null
        }
        Relationships: []
      }
      v_open_tasks: {
        Row: {
          due_date: string | null
          event_id: string | null
          event_name: string | null
          event_reference: string | null
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
          event_reference: string | null
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
          client_reference: string | null
          end_date: string | null
          event_reference: string | null
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
      accept_client_proposal: {
        Args: { p_proposal_id: string }
        Returns: undefined
      }
      accept_client_quote: { Args: { p_quote_id: string }; Returns: undefined }
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
      has_client_organisation_access: {
        Args: { p_organisation_id: string }
        Returns: boolean
      }
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
      control_session_status: "standby" | "active" | "closed"
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
      incident_action_priority: "low" | "normal" | "high" | "critical"
      incident_action_status:
        | "open"
        | "in_progress"
        | "blocked"
        | "complete"
        | "cancelled"
      incident_log_entry_type: "update" | "decision" | "action" | "correction"
      incident_severity: "minor" | "moderate" | "serious" | "critical"
      incident_status: "open" | "monitoring" | "resolved" | "closed"
      invoice_status:
        | "draft"
        | "sent"
        | "part_paid"
        | "paid"
        | "overdue"
        | "void"
      knowledge_block_approval_status: "draft" | "approved" | "superseded"
      milestone_status: "not_started" | "on_track" | "at_risk" | "complete"
      opportunity_stage:
        | "lead"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      payment_method: "bank_transfer" | "card" | "cash" | "cheque" | "other"
      proposal_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "declined"
        | "expired"
      quote_status:
        | "draft"
        | "sent"
        | "accepted"
        | "declined"
        | "expired"
        | "superseded"
      radio_message_direction: "inbound" | "outbound" | "internal"
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
      control_session_status: ["standby", "active", "closed"],
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
      incident_action_priority: ["low", "normal", "high", "critical"],
      incident_action_status: [
        "open",
        "in_progress",
        "blocked",
        "complete",
        "cancelled",
      ],
      incident_log_entry_type: ["update", "decision", "action", "correction"],
      incident_severity: ["minor", "moderate", "serious", "critical"],
      incident_status: ["open", "monitoring", "resolved", "closed"],
      invoice_status: ["draft", "sent", "part_paid", "paid", "overdue", "void"],
      knowledge_block_approval_status: ["draft", "approved", "superseded"],
      milestone_status: ["not_started", "on_track", "at_risk", "complete"],
      opportunity_stage: [
        "lead",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      payment_method: ["bank_transfer", "card", "cash", "cheque", "other"],
      proposal_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "declined",
        "expired",
      ],
      quote_status: [
        "draft",
        "sent",
        "accepted",
        "declined",
        "expired",
        "superseded",
      ],
      radio_message_direction: ["inbound", "outbound", "internal"],
      relationship_status: ["prospect", "active", "past"],
      staff_role: ["admin", "manager", "control_room", "field"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["to_do", "in_progress", "in_review", "complete"],
      template_status: ["draft", "published", "archived"],
    },
  },
} as const
