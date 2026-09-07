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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string
          category: string
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          tenant_id: string
        }
        Insert: {
          action: string
          actor_id: string
          category: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          tenant_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          category?: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      appreciation_reactions: {
        Row: {
          appreciation_id: string
          created_at: string
          emoji: string
          id: string
          user_id: string
        }
        Insert: {
          appreciation_id: string
          created_at?: string
          emoji?: string
          id?: string
          user_id: string
        }
        Update: {
          appreciation_id?: string
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appreciation_reactions_appreciation_id_fkey"
            columns: ["appreciation_id"]
            isOneToOne: false
            referencedRelation: "appreciations"
            referencedColumns: ["id"]
          },
        ]
      }
      appreciations: {
        Row: {
          created_at: string
          emoji: string | null
          from_employee_id: string | null
          id: string
          message: string
          tenant_id: string
          to_employee_id: string
          value_tag: string | null
          visibility: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          from_employee_id?: string | null
          id?: string
          message: string
          tenant_id: string
          to_employee_id: string
          value_tag?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          from_employee_id?: string | null
          id?: string
          message?: string
          tenant_id?: string
          to_employee_id?: string
          value_tag?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "appreciations_from_employee_id_fkey"
            columns: ["from_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciations_from_employee_id_fkey"
            columns: ["from_employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "appreciations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciations_to_employee_id_fkey"
            columns: ["to_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciations_to_employee_id_fkey"
            columns: ["to_employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      asset_assignments: {
        Row: {
          acknowledged_at: string | null
          acknowledgement_notes: string | null
          approval_notes: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          asset_id: string
          assigned_at: string
          assigned_by: string | null
          condition_notes: string | null
          condition_on_issue: string | null
          context: string
          created_at: string
          employee_id: string
          employee_return_notes: string | null
          employee_return_reported_at: string | null
          expected_return_on: string | null
          id: string
          metadata: Json
          notes: string | null
          quantity_issued: number
          quantity_returned: number
          return_condition: string | null
          return_confirmation_notes: string | null
          return_confirmed_at: string | null
          return_confirmed_by: string | null
          return_status: string
          returned_at: string | null
          returned_to: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledgement_notes?: string | null
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          asset_id: string
          assigned_at?: string
          assigned_by?: string | null
          condition_notes?: string | null
          condition_on_issue?: string | null
          context?: string
          created_at?: string
          employee_id: string
          employee_return_notes?: string | null
          employee_return_reported_at?: string | null
          expected_return_on?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          quantity_issued?: number
          quantity_returned?: number
          return_condition?: string | null
          return_confirmation_notes?: string | null
          return_confirmed_at?: string | null
          return_confirmed_by?: string | null
          return_status?: string
          returned_at?: string | null
          returned_to?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledgement_notes?: string | null
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          asset_id?: string
          assigned_at?: string
          assigned_by?: string | null
          condition_notes?: string | null
          condition_on_issue?: string | null
          context?: string
          created_at?: string
          employee_id?: string
          employee_return_notes?: string | null
          employee_return_reported_at?: string | null
          expected_return_on?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          quantity_issued?: number
          quantity_returned?: number
          return_condition?: string | null
          return_confirmation_notes?: string | null
          return_confirmed_at?: string | null
          return_confirmed_by?: string | null
          return_status?: string
          returned_at?: string | null
          returned_to?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_assignments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_tag: string
          branch_id: string | null
          brand: string | null
          category: Database["public"]["Enums"]["asset_category"]
          created_at: string
          created_by: string | null
          currency_code: string | null
          current_assignment_id: string | null
          description: string | null
          id: string
          location_label: string | null
          metadata: Json
          model: string | null
          name: string
          purchase_cost: number | null
          purchase_date: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["asset_status"]
          tenant_id: string
          updated_at: string
          warranty_expires_on: string | null
        }
        Insert: {
          asset_tag: string
          branch_id?: string | null
          brand?: string | null
          category?: Database["public"]["Enums"]["asset_category"]
          created_at?: string
          created_by?: string | null
          currency_code?: string | null
          current_assignment_id?: string | null
          description?: string | null
          id?: string
          location_label?: string | null
          metadata?: Json
          model?: string | null
          name: string
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          tenant_id: string
          updated_at?: string
          warranty_expires_on?: string | null
        }
        Update: {
          asset_tag?: string
          branch_id?: string | null
          brand?: string | null
          category?: Database["public"]["Enums"]["asset_category"]
          created_at?: string
          created_by?: string | null
          currency_code?: string | null
          current_assignment_id?: string | null
          description?: string | null
          id?: string
          location_label?: string | null
          metadata?: Json
          model?: string | null
          name?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          tenant_id?: string
          updated_at?: string
          warranty_expires_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_entries: {
        Row: {
          break_minutes: number
          clock_in: string | null
          clock_in_accuracy_meters: number | null
          clock_in_distance_meters: number | null
          clock_in_geofence_id: string | null
          clock_in_latitude: number | null
          clock_in_longitude: number | null
          clock_in_recorded_at: string | null
          clock_in_skew_seconds: number | null
          clock_out: string | null
          clock_out_accuracy_meters: number | null
          clock_out_distance_meters: number | null
          clock_out_geofence_id: string | null
          clock_out_latitude: number | null
          clock_out_longitude: number | null
          clock_out_recorded_at: string | null
          clock_out_skew_seconds: number | null
          created_at: string
          employee_id: string
          hours_worked: number
          id: string
          needs_review: boolean
          notes: string | null
          review_reason: string | null
          source: string
          status: string
          tenant_id: string
          timesheet_id: string | null
          updated_at: string
          work_date: string
          work_location: string | null
          work_timezone: string | null
        }
        Insert: {
          break_minutes?: number
          clock_in?: string | null
          clock_in_accuracy_meters?: number | null
          clock_in_distance_meters?: number | null
          clock_in_geofence_id?: string | null
          clock_in_latitude?: number | null
          clock_in_longitude?: number | null
          clock_in_recorded_at?: string | null
          clock_in_skew_seconds?: number | null
          clock_out?: string | null
          clock_out_accuracy_meters?: number | null
          clock_out_distance_meters?: number | null
          clock_out_geofence_id?: string | null
          clock_out_latitude?: number | null
          clock_out_longitude?: number | null
          clock_out_recorded_at?: string | null
          clock_out_skew_seconds?: number | null
          created_at?: string
          employee_id: string
          hours_worked?: number
          id?: string
          needs_review?: boolean
          notes?: string | null
          review_reason?: string | null
          source?: string
          status?: string
          tenant_id: string
          timesheet_id?: string | null
          updated_at?: string
          work_date: string
          work_location?: string | null
          work_timezone?: string | null
        }
        Update: {
          break_minutes?: number
          clock_in?: string | null
          clock_in_accuracy_meters?: number | null
          clock_in_distance_meters?: number | null
          clock_in_geofence_id?: string | null
          clock_in_latitude?: number | null
          clock_in_longitude?: number | null
          clock_in_recorded_at?: string | null
          clock_in_skew_seconds?: number | null
          clock_out?: string | null
          clock_out_accuracy_meters?: number | null
          clock_out_distance_meters?: number | null
          clock_out_geofence_id?: string | null
          clock_out_latitude?: number | null
          clock_out_longitude?: number | null
          clock_out_recorded_at?: string | null
          clock_out_skew_seconds?: number | null
          created_at?: string
          employee_id?: string
          hours_worked?: number
          id?: string
          needs_review?: boolean
          notes?: string | null
          review_reason?: string | null
          source?: string
          status?: string
          tenant_id?: string
          timesheet_id?: string | null
          updated_at?: string
          work_date?: string
          work_location?: string | null
          work_timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_entries_clock_in_geofence_id_fkey"
            columns: ["clock_in_geofence_id"]
            isOneToOne: false
            referencedRelation: "sign_geofences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_entries_clock_out_geofence_id_fkey"
            columns: ["clock_out_geofence_id"]
            isOneToOne: false
            referencedRelation: "sign_geofences"
            referencedColumns: ["id"]
          },
        ]
      }
      au_holiday_sync_log: {
        Row: {
          completed_at: string | null
          created_at: string
          csv_parse_errors: Json
          error_message: string | null
          id: string
          inserted_count: number
          skipped_count: number
          source_url: string | null
          started_at: string
          status: string
          synced_by: string | null
          tenant_id: string | null
          total_count: number
          year: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          csv_parse_errors?: Json
          error_message?: string | null
          id?: string
          inserted_count?: number
          skipped_count?: number
          source_url?: string | null
          started_at?: string
          status: string
          synced_by?: string | null
          tenant_id?: string | null
          total_count?: number
          year: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          csv_parse_errors?: Json
          error_message?: string | null
          id?: string
          inserted_count?: number
          skipped_count?: number
          source_url?: string | null
          started_at?: string
          status?: string
          synced_by?: string | null
          tenant_id?: string | null
          total_count?: number
          year?: number
        }
        Relationships: []
      }
      au_payday_super_obligations: {
        Row: {
          created_at: string
          due_by: string
          employee_id: string
          id: string
          ote_amount: number
          paid_at: string | null
          pay_date: string
          sg_amount: number
          sg_rate: number
          status: string
          super_fund_abn: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_by: string
          employee_id: string
          id?: string
          ote_amount?: number
          paid_at?: string | null
          pay_date: string
          sg_amount?: number
          sg_rate?: number
          status?: string
          super_fund_abn?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_by?: string
          employee_id?: string
          id?: string
          ote_amount?: number
          paid_at?: string | null
          pay_date?: string
          sg_amount?: number
          sg_rate?: number
          status?: string
          super_fund_abn?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "au_payday_super_obligations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "au_payday_super_obligations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      au_sg_rates: {
        Row: {
          created_at: string
          effective_from: string
          max_contribution_base_quarterly: number | null
          notes: string | null
          rate: number
        }
        Insert: {
          created_at?: string
          effective_from: string
          max_contribution_base_quarterly?: number | null
          notes?: string | null
          rate: number
        }
        Update: {
          created_at?: string
          effective_from?: string
          max_contribution_base_quarterly?: number | null
          notes?: string | null
          rate?: number
        }
        Relationships: []
      }
      au_stp_submissions: {
        Row: {
          ato_response: Json | null
          bms_id: string | null
          created_at: string
          created_by: string | null
          id: string
          pay_run_id: string | null
          payload: Json
          reporting_period_end: string | null
          reporting_period_start: string | null
          status: string
          submission_type: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          ato_response?: Json | null
          bms_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          pay_run_id?: string | null
          payload?: Json
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          status?: string
          submission_type: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          ato_response?: Json | null
          bms_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          pay_run_id?: string | null
          payload?: Json
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          status?: string
          submission_type?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      audit_retention_policies: {
        Row: {
          archive_after_days: number
          created_at: string
          delete_after_days: number
          id: string
          is_active: boolean
          last_archived_at: string | null
          last_archived_count: number | null
          last_deleted_at: string | null
          last_deleted_count: number | null
          last_run_at: string | null
          last_run_error: string | null
          last_run_status: string | null
          table_name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          archive_after_days?: number
          created_at?: string
          delete_after_days?: number
          id?: string
          is_active?: boolean
          last_archived_at?: string | null
          last_archived_count?: number | null
          last_deleted_at?: string | null
          last_deleted_count?: number | null
          last_run_at?: string | null
          last_run_error?: string | null
          last_run_status?: string | null
          table_name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          archive_after_days?: number
          created_at?: string
          delete_after_days?: number
          id?: string
          is_active?: boolean
          last_archived_at?: string | null
          last_archived_count?: number | null
          last_deleted_at?: string | null
          last_deleted_count?: number | null
          last_run_at?: string | null
          last_run_error?: string | null
          last_run_status?: string | null
          table_name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_retention_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      award_classifications: {
        Row: {
          award_id: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          level: number | null
          name: string
          parent_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          award_id: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level?: number | null
          name: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          award_id?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level?: number | null
          name?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "award_classifications_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_classifications_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "award_classifications"
            referencedColumns: ["id"]
          },
        ]
      }
      award_cycles: {
        Row: {
          award_type_id: string
          created_at: string
          id: string
          nominations_close_at: string | null
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["award_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          award_type_id: string
          created_at?: string
          id?: string
          nominations_close_at?: string | null
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["award_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          award_type_id?: string
          created_at?: string
          id?: string
          nominations_close_at?: string | null
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["award_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "award_cycles_award_type_id_fkey"
            columns: ["award_type_id"]
            isOneToOne: false
            referencedRelation: "award_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_cycles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      award_nominations: {
        Row: {
          created_at: string
          cycle_id: string
          decided_at: string | null
          decided_by: string | null
          decision_notes: string | null
          id: string
          justification: string
          nominator_employee_id: string | null
          nominator_user_id: string | null
          nominee_employee_id: string
          status: Database["public"]["Enums"]["nomination_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_id: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          id?: string
          justification: string
          nominator_employee_id?: string | null
          nominator_user_id?: string | null
          nominee_employee_id: string
          status?: Database["public"]["Enums"]["nomination_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_id?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          id?: string
          justification?: string
          nominator_employee_id?: string | null
          nominator_user_id?: string | null
          nominee_employee_id?: string
          status?: Database["public"]["Enums"]["nomination_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "award_nominations_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "award_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_nominations_nominator_employee_id_fkey"
            columns: ["nominator_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_nominations_nominator_employee_id_fkey"
            columns: ["nominator_employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "award_nominations_nominee_employee_id_fkey"
            columns: ["nominee_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_nominations_nominee_employee_id_fkey"
            columns: ["nominee_employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "award_nominations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      award_rates: {
        Row: {
          allowances: Json
          annual_rate: number | null
          casual_loading_pct: number | null
          classification_id: string
          created_at: string
          effective_from: string
          effective_to: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean
          notes: string | null
          penalty_multipliers: Json
          updated_at: string
          weekly_rate: number | null
        }
        Insert: {
          allowances?: Json
          annual_rate?: number | null
          casual_loading_pct?: number | null
          classification_id: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          notes?: string | null
          penalty_multipliers?: Json
          updated_at?: string
          weekly_rate?: number | null
        }
        Update: {
          allowances?: Json
          annual_rate?: number | null
          casual_loading_pct?: number | null
          classification_id?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          notes?: string | null
          penalty_multipliers?: Json
          updated_at?: string
          weekly_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "award_rates_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "award_classifications"
            referencedColumns: ["id"]
          },
        ]
      }
      award_types: {
        Row: {
          cadence: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cadence?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cadence?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "award_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          code: string
          country_code: string
          created_at: string
          description: string | null
          id: string
          industry: string | null
          is_active: boolean
          name: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          code: string
          country_code: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          name: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          country_code?: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          name?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      awards_granted: {
        Row: {
          announced: boolean
          award_type_id: string
          certificate_url: string | null
          citation: string
          created_at: string
          cycle_id: string
          granted_by: string | null
          granted_on: string
          id: string
          nomination_id: string | null
          recipient_employee_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          announced?: boolean
          award_type_id: string
          certificate_url?: string | null
          citation: string
          created_at?: string
          cycle_id: string
          granted_by?: string | null
          granted_on?: string
          id?: string
          nomination_id?: string | null
          recipient_employee_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          announced?: boolean
          award_type_id?: string
          certificate_url?: string | null
          citation?: string
          created_at?: string
          cycle_id?: string
          granted_by?: string | null
          granted_on?: string
          id?: string
          nomination_id?: string | null
          recipient_employee_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "awards_granted_award_type_id_fkey"
            columns: ["award_type_id"]
            isOneToOne: false
            referencedRelation: "award_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_granted_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "award_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_granted_nomination_id_fkey"
            columns: ["nomination_id"]
            isOneToOne: false
            referencedRelation: "award_nominations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_granted_recipient_employee_id_fkey"
            columns: ["recipient_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_granted_recipient_employee_id_fkey"
            columns: ["recipient_employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "awards_granted_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_admin_alerts: {
        Row: {
          alert_type: string
          auto_retry_exhausted: boolean
          context: Json
          created_at: string
          id: string
          idempotency_key: string | null
          last_auto_retry_at: string | null
          last_retry_at: string | null
          message: string | null
          next_retry_at: string | null
          notified_at: string | null
          resolved_at: string | null
          resolved_by: string | null
          retry_count: number
          severity: string
          status: string
          suppressed: boolean
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          alert_type: string
          auto_retry_exhausted?: boolean
          context?: Json
          created_at?: string
          id?: string
          idempotency_key?: string | null
          last_auto_retry_at?: string | null
          last_retry_at?: string | null
          message?: string | null
          next_retry_at?: string | null
          notified_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          retry_count?: number
          severity?: string
          status?: string
          suppressed?: boolean
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          auto_retry_exhausted?: boolean
          context?: Json
          created_at?: string
          id?: string
          idempotency_key?: string | null
          last_auto_retry_at?: string | null
          last_retry_at?: string | null
          message?: string | null
          next_retry_at?: string | null
          notified_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          retry_count?: number
          severity?: string
          status?: string
          suppressed?: boolean
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_admin_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_alert_retry_policies: {
        Row: {
          alert_type: string
          backoff_multiplier: number
          backoff_seconds: number
          created_at: string
          enabled: boolean
          max_attempts: number
          max_backoff_seconds: number
          updated_at: string
        }
        Insert: {
          alert_type: string
          backoff_multiplier?: number
          backoff_seconds?: number
          created_at?: string
          enabled?: boolean
          max_attempts?: number
          max_backoff_seconds?: number
          updated_at?: string
        }
        Update: {
          alert_type?: string
          backoff_multiplier?: number
          backoff_seconds?: number
          created_at?: string
          enabled?: boolean
          max_attempts?: number
          max_backoff_seconds?: number
          updated_at?: string
        }
        Relationships: []
      }
      billing_alert_suppressions: {
        Row: {
          alert_type: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          reason: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          alert_type?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          alert_type?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_alert_suppressions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_audit_log: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          stripe_event_id: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          stripe_event_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          stripe_event_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_ops_audit: {
        Row: {
          action: string
          actor_email: string | null
          actor_user_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          id: string
          metadata: Json
          target_id: string | null
          target_type: string | null
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_user_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_user_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_ops_audit_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_reconciliation_log: {
        Row: {
          addon_delta: number
          base_delta: number
          computed_addon: number
          computed_base: number
          created_at: string
          has_discrepancy: boolean
          id: string
          notes: string | null
          period_month: number
          period_year: number
          reported_addon: number
          reported_base: number
          snapshot_data: Json | null
          tenant_id: string
        }
        Insert: {
          addon_delta?: number
          base_delta?: number
          computed_addon?: number
          computed_base?: number
          created_at?: string
          has_discrepancy?: boolean
          id?: string
          notes?: string | null
          period_month: number
          period_year: number
          reported_addon?: number
          reported_base?: number
          snapshot_data?: Json | null
          tenant_id: string
        }
        Update: {
          addon_delta?: number
          base_delta?: number
          computed_addon?: number
          computed_base?: number
          created_at?: string
          has_discrepancy?: boolean
          id?: string
          notes?: string | null
          period_month?: number
          period_year?: number
          reported_addon?: number
          reported_base?: number
          snapshot_data?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_reconciliation_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_devices: {
        Row: {
          branch_id: string | null
          config: Json
          created_at: string
          device_serial: string | null
          id: string
          ip_address: string | null
          is_active: boolean
          last_punch_at: string | null
          last_sync_at: string | null
          location: string | null
          name: string
          shared_secret: string
          tenant_id: string
          updated_at: string
          vendor: Database["public"]["Enums"]["biometric_vendor"]
          webhook_token: string
        }
        Insert: {
          branch_id?: string | null
          config?: Json
          created_at?: string
          device_serial?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_punch_at?: string | null
          last_sync_at?: string | null
          location?: string | null
          name: string
          shared_secret?: string
          tenant_id: string
          updated_at?: string
          vendor?: Database["public"]["Enums"]["biometric_vendor"]
          webhook_token?: string
        }
        Update: {
          branch_id?: string | null
          config?: Json
          created_at?: string
          device_serial?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_punch_at?: string | null
          last_sync_at?: string | null
          location?: string | null
          name?: string
          shared_secret?: string
          tenant_id?: string
          updated_at?: string
          vendor?: Database["public"]["Enums"]["biometric_vendor"]
          webhook_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "biometric_devices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biometric_devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_punches: {
        Row: {
          attendance_entry_id: string | null
          device_id: string
          employee_id: string | null
          id: string
          ingested_at: string
          processed: boolean
          punch_at: string
          punch_type: Database["public"]["Enums"]["biometric_punch_type"]
          raw: Json
          raw_user_id: string
          source: string
          tenant_id: string
        }
        Insert: {
          attendance_entry_id?: string | null
          device_id: string
          employee_id?: string | null
          id?: string
          ingested_at?: string
          processed?: boolean
          punch_at: string
          punch_type?: Database["public"]["Enums"]["biometric_punch_type"]
          raw?: Json
          raw_user_id: string
          source?: string
          tenant_id: string
        }
        Update: {
          attendance_entry_id?: string | null
          device_id?: string
          employee_id?: string | null
          id?: string
          ingested_at?: string
          processed?: boolean
          punch_at?: string
          punch_type?: Database["public"]["Enums"]["biometric_punch_type"]
          raw?: Json
          raw_user_id?: string
          source?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "biometric_punches_attendance_entry_id_fkey"
            columns: ["attendance_entry_id"]
            isOneToOne: false
            referencedRelation: "attendance_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biometric_punches_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "biometric_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biometric_punches_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biometric_punches_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "biometric_punches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_user_mappings: {
        Row: {
          created_at: string
          device_id: string
          employee_id: string
          id: string
          raw_user_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          employee_id: string
          id?: string
          raw_user_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          employee_id?: string
          id?: string
          raw_user_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "biometric_user_mappings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "biometric_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biometric_user_mappings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biometric_user_mappings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "biometric_user_mappings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_access_audit: {
        Row: {
          api_key_id: string | null
          created_at: string
          id: string
          ip: string | null
          metadata: Json
          method: string | null
          reason: string
          route: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json
          method?: string | null
          reason: string
          route: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json
          method?: string | null
          reason?: string
          route?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key_hash: string
          last_used_at: string | null
          name: string
          prefix: string
          revoked_at: string | null
          scopes: string[]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash: string
          last_used_at?: string | null
          name: string
          prefix: string
          revoked_at?: string | null
          scopes?: string[]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash?: string
          last_used_at?: string | null
          name?: string
          prefix?: string
          revoked_at?: string | null
          scopes?: string[]
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          canonical_url: string | null
          category_id: string | null
          content_html: string | null
          content_md: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          external_ref: string | null
          external_source: string | null
          id: string
          og_image_url: string | null
          published_at: string | null
          reading_minutes: number | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["blog_post_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content_html?: string | null
          content_md?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          external_ref?: string | null
          external_source?: string | null
          id?: string
          og_image_url?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["blog_post_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content_html?: string | null
          content_md?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          external_ref?: string | null
          external_source?: string | null
          id?: string
          og_image_url?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_post_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_webhook_deliveries: {
        Row: {
          attempts: number
          created_at: string
          event: string
          id: string
          last_attempted_at: string | null
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string
          webhook_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          event: string
          id?: string
          last_attempted_at?: string | null
          next_retry_at?: string | null
          payload: Json
          response_body?: string | null
          response_status?: number | null
          status?: string
          webhook_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          event?: string
          id?: string
          last_attempted_at?: string | null
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "blog_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_webhooks: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          events: string[]
          id: string
          last_rotated_at: string | null
          name: string
          rotated_by: string | null
          secret: string
          secret_hash: string | null
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          last_rotated_at?: string | null
          name: string
          rotated_by?: string | null
          secret: string
          secret_hash?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          last_rotated_at?: string | null
          name?: string
          rotated_by?: string | null
          secret?: string
          secret_hash?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      careers_analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          job_id: string | null
          metadata: Json
          referrer: string | null
          session_id: string | null
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          job_id?: string | null
          metadata?: Json
          referrer?: string | null
          session_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          job_id?: string | null
          metadata?: Json
          referrer?: string | null
          session_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "careers_analytics_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "recruitment_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "careers_analytics_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          created_by: string | null
          credential_id: string | null
          employee_id: string
          expires_on: string | null
          file_url: string | null
          id: string
          issued_on: string | null
          issuer: string | null
          name: string
          source_course_id: string | null
          source_enrollment_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          credential_id?: string | null
          employee_id: string
          expires_on?: string | null
          file_url?: string | null
          id?: string
          issued_on?: string | null
          issuer?: string | null
          name: string
          source_course_id?: string | null
          source_enrollment_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          credential_id?: string | null
          employee_id?: string
          expires_on?: string | null
          file_url?: string | null
          id?: string
          issued_on?: string | null
          issuer?: string | null
          name?: string
          source_course_id?: string | null
          source_enrollment_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "certifications_source_course_id_fkey"
            columns: ["source_course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_source_enrollment_id_fkey"
            columns: ["source_enrollment_id"]
            isOneToOne: false
            referencedRelation: "training_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      client_jobs: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          name: string
          priority: string
          project_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          name: string
          priority?: string
          project_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          name?: string
          priority?: string
          project_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          billing_address: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country_code: string | null
          created_at: string
          created_by: string | null
          currency_code: string | null
          id: string
          name: string
          notes: string | null
          status: string
          tax_number: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          billing_address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string | null
          id?: string
          name: string
          notes?: string | null
          status?: string
          tax_number?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          billing_address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string | null
          id?: string
          name?: string
          notes?: string | null
          status?: string
          tax_number?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_reminder_log: {
        Row: {
          channel: string
          escalated: boolean
          id: string
          ref_id: string
          scope: string
          sent_at: string
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          channel: string
          escalated?: boolean
          id?: string
          ref_id: string
          scope: string
          sent_at?: string
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          escalated?: boolean
          id?: string
          ref_id?: string
          scope?: string
          sent_at?: string
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reminder_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contribution_rules: {
        Row: {
          country_code: string
          created_at: string
          effective_from: string
          effective_to: string | null
          employee_rate_percent: number
          employer_rate_percent: number
          id: string
          is_active: boolean
          max_base: number | null
          min_base: number
          name: string
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          employee_rate_percent?: number
          employer_rate_percent?: number
          id?: string
          is_active?: boolean
          max_base?: number | null
          min_base?: number
          name: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_rate_percent?: number
          employer_rate_percent?: number
          id?: string
          is_active?: boolean
          max_base?: number | null
          min_base?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contribution_rules_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          currency_code: string
          name: string
          region_code: string
        }
        Insert: {
          code: string
          created_at?: string
          currency_code: string
          name: string
          region_code: string
        }
        Update: {
          code?: string
          created_at?: string
          currency_code?: string
          name?: string
          region_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "countries_region_code_fkey"
            columns: ["region_code"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["code"]
          },
        ]
      }
      country_payroll_settings: {
        Row: {
          country_code: string
          created_at: string
          fiscal_year_start_month: number
          holiday_pay_multiplier: number
          notes: string | null
          overtime_multiplier: number
          pay_frequency: Database["public"]["Enums"]["pay_frequency"]
          rounding_decimals: number
          rounding_mode: string
          updated_at: string
          workweek_hours: number
        }
        Insert: {
          country_code: string
          created_at?: string
          fiscal_year_start_month?: number
          holiday_pay_multiplier?: number
          notes?: string | null
          overtime_multiplier?: number
          pay_frequency?: Database["public"]["Enums"]["pay_frequency"]
          rounding_decimals?: number
          rounding_mode?: string
          updated_at?: string
          workweek_hours?: number
        }
        Update: {
          country_code?: string
          created_at?: string
          fiscal_year_start_month?: number
          holiday_pay_multiplier?: number
          notes?: string | null
          overtime_multiplier?: number
          pay_frequency?: Database["public"]["Enums"]["pay_frequency"]
          rounding_decimals?: number
          rounding_mode?: string
          updated_at?: string
          workweek_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "country_payroll_settings_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: true
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      csv_export_jobs: {
        Row: {
          attempt: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          expires_at: string | null
          filters: Json
          id: string
          job_type: string
          parent_job_id: string | null
          progress: number
          requested_by: string
          result_csv: string | null
          row_count: number | null
          started_at: string | null
          status: string
          tenant_id: string
          truncated: boolean
        }
        Insert: {
          attempt?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          filters?: Json
          id?: string
          job_type: string
          parent_job_id?: string | null
          progress?: number
          requested_by: string
          result_csv?: string | null
          row_count?: number | null
          started_at?: string | null
          status?: string
          tenant_id: string
          truncated?: boolean
        }
        Update: {
          attempt?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          filters?: Json
          id?: string
          job_type?: string
          parent_job_id?: string | null
          progress?: number
          requested_by?: string
          result_csv?: string | null
          row_count?: number | null
          started_at?: string | null
          status?: string
          tenant_id?: string
          truncated?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "csv_export_jobs_parent_job_id_fkey"
            columns: ["parent_job_id"]
            isOneToOne: false
            referencedRelation: "csv_export_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          default_holiday_category_id: string | null
          id: string
          manager_id: string | null
          name: string
          parent_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_holiday_category_id?: string | null
          id?: string
          manager_id?: string | null
          name: string
          parent_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_holiday_category_id?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          parent_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_default_holiday_category_id_fkey"
            columns: ["default_holiday_category_id"]
            isOneToOne: false
            referencedRelation: "public_holiday_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      designations: {
        Row: {
          code: string | null
          created_at: string
          currency_code: string | null
          department_id: string | null
          description: string | null
          grade: string | null
          id: string
          is_active: boolean
          max_salary: number | null
          min_salary: number | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          currency_code?: string | null
          department_id?: string | null
          description?: string | null
          grade?: string | null
          id?: string
          is_active?: boolean
          max_salary?: number | null
          min_salary?: number | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          currency_code?: string | null
          department_id?: string | null
          description?: string | null
          grade?: string | null
          id?: string
          is_active?: boolean
          max_salary?: number | null
          min_salary?: number | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "designations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinary_actions: {
        Row: {
          action_date: string
          action_type: string
          case_id: string
          created_at: string
          document_url: string | null
          id: string
          notes: string | null
          performed_by: string | null
          tenant_id: string
        }
        Insert: {
          action_date?: string
          action_type: string
          case_id: string
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          tenant_id: string
        }
        Update: {
          action_date?: string
          action_type?: string
          case_id?: string
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_actions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "disciplinary_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinary_approvals: {
        Row: {
          approver_id: string
          approver_role: string
          case_id: string
          decided_at: string | null
          decision: string | null
          id: string
          notes: string | null
          requested_at: string
          requested_by: string
          tenant_id: string
        }
        Insert: {
          approver_id: string
          approver_role: string
          case_id: string
          decided_at?: string | null
          decision?: string | null
          id?: string
          notes?: string | null
          requested_at?: string
          requested_by: string
          tenant_id: string
        }
        Update: {
          approver_id?: string
          approver_role?: string
          case_id?: string
          decided_at?: string | null
          decision?: string | null
          id?: string
          notes?: string | null
          requested_at?: string
          requested_by?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_approvals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "disciplinary_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinary_attachments: {
        Row: {
          case_id: string
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          tenant_id: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          tenant_id: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          tenant_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_attachments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "disciplinary_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinary_cases: {
        Row: {
          appeal_deadline: string | null
          assigned_to: string | null
          case_number: string | null
          category: string
          closed_at: string | null
          closed_by: string | null
          confidential: boolean
          created_at: string
          description: string
          due_date: string | null
          employee_id: string
          id: string
          incident_date: string | null
          opened_by: string | null
          outcome: string | null
          severity: string
          status: string
          tenant_id: string
          updated_at: string
          withdrawn_at: string | null
        }
        Insert: {
          appeal_deadline?: string | null
          assigned_to?: string | null
          case_number?: string | null
          category: string
          closed_at?: string | null
          closed_by?: string | null
          confidential?: boolean
          created_at?: string
          description: string
          due_date?: string | null
          employee_id: string
          id?: string
          incident_date?: string | null
          opened_by?: string | null
          outcome?: string | null
          severity?: string
          status?: string
          tenant_id: string
          updated_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          appeal_deadline?: string | null
          assigned_to?: string | null
          case_number?: string | null
          category?: string
          closed_at?: string | null
          closed_by?: string | null
          confidential?: boolean
          created_at?: string
          description?: string
          due_date?: string | null
          employee_id?: string
          id?: string
          incident_date?: string | null
          opened_by?: string | null
          outcome?: string | null
          severity?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_cases_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_cases_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      disciplinary_overdue_state: {
        Row: {
          alert_count: number
          case_id: string
          last_alert_date: string | null
          tenant_id: string
        }
        Insert: {
          alert_count?: number
          case_id: string
          last_alert_date?: string | null
          tenant_id: string
        }
        Update: {
          alert_count?: number
          case_id?: string
          last_alert_date?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_overdue_state_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "disciplinary_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      document_envelopes: {
        Row: {
          allowed_geofence_ids: string[]
          body_html_snapshot: string
          bulk_batch_id: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          certificate_token: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          doc_type: Database["public"]["Enums"]["document_type"]
          due_date: string | null
          employee_id: string | null
          first_viewed_at: string | null
          id: string
          last_reminder_at: string | null
          merge_values: Json
          metadata: Json
          recipient_email: string | null
          recipient_name: string | null
          reminder_count: number
          require_geofence: boolean
          requires_countersign: boolean
          requires_signature: boolean
          sent_at: string | null
          signed_certificate_html: string | null
          signed_document_path: string | null
          status: Database["public"]["Enums"]["document_envelope_status"]
          subject: string
          template_id: string | null
          template_version: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allowed_geofence_ids?: string[]
          body_html_snapshot: string
          bulk_batch_id?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          certificate_token?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          doc_type?: Database["public"]["Enums"]["document_type"]
          due_date?: string | null
          employee_id?: string | null
          first_viewed_at?: string | null
          id?: string
          last_reminder_at?: string | null
          merge_values?: Json
          metadata?: Json
          recipient_email?: string | null
          recipient_name?: string | null
          reminder_count?: number
          require_geofence?: boolean
          requires_countersign?: boolean
          requires_signature?: boolean
          sent_at?: string | null
          signed_certificate_html?: string | null
          signed_document_path?: string | null
          status?: Database["public"]["Enums"]["document_envelope_status"]
          subject: string
          template_id?: string | null
          template_version?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allowed_geofence_ids?: string[]
          body_html_snapshot?: string
          bulk_batch_id?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          certificate_token?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          doc_type?: Database["public"]["Enums"]["document_type"]
          due_date?: string | null
          employee_id?: string | null
          first_viewed_at?: string | null
          id?: string
          last_reminder_at?: string | null
          merge_values?: Json
          metadata?: Json
          recipient_email?: string | null
          recipient_name?: string | null
          reminder_count?: number
          require_geofence?: boolean
          requires_countersign?: boolean
          requires_signature?: boolean
          sent_at?: string | null
          signed_certificate_html?: string | null
          signed_document_path?: string | null
          status?: Database["public"]["Enums"]["document_envelope_status"]
          subject?: string
          template_id?: string | null
          template_version?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_envelopes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_envelopes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "document_envelopes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_envelopes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_events: {
        Row: {
          actor_email: string | null
          actor_user_id: string | null
          created_at: string
          envelope_id: string
          event: string
          id: string
          ip: string | null
          metadata: Json
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string
          envelope_id: string
          event: string
          id?: string
          ip?: string | null
          metadata?: Json
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string
          envelope_id?: string
          event?: string
          id?: string
          ip?: string | null
          metadata?: Json
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_events_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "document_envelopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_request_template_items: {
        Row: {
          created_at: string
          document_template_id: string
          due_offset_days: number
          id: string
          required_signature: boolean
          sort_order: number
          template_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          document_template_id: string
          due_offset_days?: number
          id?: string
          required_signature?: boolean
          sort_order?: number
          template_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          document_template_id?: string
          due_offset_days?: number
          id?: string
          required_signature?: boolean
          sort_order?: number
          template_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_request_template_items_document_template_id_fkey"
            columns: ["document_template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_request_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_request_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_request_template_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_request_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          trigger: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          trigger?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          trigger?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_request_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_signers: {
        Row: {
          audit_hash: string | null
          created_at: string
          decline_reason: string | null
          declined_at: string | null
          envelope_id: string
          id: string
          order_index: number
          role: string
          signature_drawn_svg: string | null
          signature_geo_accuracy_m: number | null
          signature_geofence_id: string | null
          signature_ip: string | null
          signature_latitude: number | null
          signature_longitude: number | null
          signature_method:
            | Database["public"]["Enums"]["signature_method"]
            | null
          signature_typed: string | null
          signature_user_agent: string | null
          signed_at: string | null
          signer_email: string
          signer_employee_id: string | null
          signer_name: string
          signer_user_id: string | null
          status: Database["public"]["Enums"]["document_signer_status"]
          tenant_id: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          audit_hash?: string | null
          created_at?: string
          decline_reason?: string | null
          declined_at?: string | null
          envelope_id: string
          id?: string
          order_index?: number
          role?: string
          signature_drawn_svg?: string | null
          signature_geo_accuracy_m?: number | null
          signature_geofence_id?: string | null
          signature_ip?: string | null
          signature_latitude?: number | null
          signature_longitude?: number | null
          signature_method?:
            | Database["public"]["Enums"]["signature_method"]
            | null
          signature_typed?: string | null
          signature_user_agent?: string | null
          signed_at?: string | null
          signer_email: string
          signer_employee_id?: string | null
          signer_name: string
          signer_user_id?: string | null
          status?: Database["public"]["Enums"]["document_signer_status"]
          tenant_id: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          audit_hash?: string | null
          created_at?: string
          decline_reason?: string | null
          declined_at?: string | null
          envelope_id?: string
          id?: string
          order_index?: number
          role?: string
          signature_drawn_svg?: string | null
          signature_geo_accuracy_m?: number | null
          signature_geofence_id?: string | null
          signature_ip?: string | null
          signature_latitude?: number | null
          signature_longitude?: number | null
          signature_method?:
            | Database["public"]["Enums"]["signature_method"]
            | null
          signature_typed?: string | null
          signature_user_agent?: string | null
          signed_at?: string | null
          signer_email?: string
          signer_employee_id?: string | null
          signer_name?: string
          signer_user_id?: string | null
          status?: Database["public"]["Enums"]["document_signer_status"]
          tenant_id?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_signers_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "document_envelopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_signers_signature_geofence_id_fkey"
            columns: ["signature_geofence_id"]
            isOneToOne: false
            referencedRelation: "sign_geofences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_signers_signer_employee_id_fkey"
            columns: ["signer_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_signers_signer_employee_id_fkey"
            columns: ["signer_employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "document_signers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          body_html: string
          countersigner_role: string | null
          created_at: string
          created_by: string | null
          default_due_days: number
          description: string | null
          doc_type: Database["public"]["Enums"]["document_type"]
          id: string
          merge_fields: Json
          name: string
          parent_template_id: string | null
          published_at: string | null
          published_by: string | null
          requires_countersign: boolean
          requires_signature: boolean
          status: Database["public"]["Enums"]["document_template_status"]
          tenant_id: string
          updated_at: string
          version: number
        }
        Insert: {
          body_html?: string
          countersigner_role?: string | null
          created_at?: string
          created_by?: string | null
          default_due_days?: number
          description?: string | null
          doc_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          merge_fields?: Json
          name: string
          parent_template_id?: string | null
          published_at?: string | null
          published_by?: string | null
          requires_countersign?: boolean
          requires_signature?: boolean
          status?: Database["public"]["Enums"]["document_template_status"]
          tenant_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          body_html?: string
          countersigner_role?: string | null
          created_at?: string
          created_by?: string | null
          default_due_days?: number
          description?: string | null
          doc_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          merge_fields?: Json
          name?: string
          parent_template_id?: string | null
          published_at?: string | null
          published_by?: string | null
          requires_countersign?: boolean
          requires_signature?: boolean
          status?: Database["public"]["Enums"]["document_template_status"]
          tenant_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_parent_template_id_fkey"
            columns: ["parent_template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      duty_review_scores: {
        Row: {
          comments: string | null
          created_at: string
          cycle_label: string
          duty_id: string
          employee_id: string
          id: string
          reviewer_id: string | null
          score: number
          submitter_kind: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          cycle_label: string
          duty_id: string
          employee_id: string
          id?: string
          reviewer_id?: string | null
          score: number
          submitter_kind?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          cycle_label?: string
          duty_id?: string
          employee_id?: string
          id?: string
          reviewer_id?: string | null
          score?: number
          submitter_kind?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "duty_review_scores_duty_id_fkey"
            columns: ["duty_id"]
            isOneToOne: false
            referencedRelation: "employee_duties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duty_review_scores_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duty_review_scores_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      employee_award_assignments: {
        Row: {
          casual: boolean
          classification_id: string
          created_at: string
          created_by: string | null
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          notes: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          casual?: boolean
          classification_id: string
          created_at?: string
          created_by?: string | null
          effective_from: string
          effective_to?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          casual?: boolean
          classification_id?: string
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_award_assignments_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "award_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_award_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_award_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_award_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          category: Database["public"]["Enums"]["employee_document_category"]
          created_at: string
          doc_type: string
          employee_id: string
          expiry_date: string | null
          file_name: string
          file_path: string
          id: string
          issued_date: string | null
          issuer: string | null
          mime_type: string | null
          notes: string | null
          reference_number: string | null
          size_bytes: number | null
          source_envelope_id: string | null
          tenant_id: string
          updated_at: string
          uploaded_by: string | null
          verification_notes: string | null
          verification_status: Database["public"]["Enums"]["employee_document_verification"]
          verified_at: string | null
          verified_by: string | null
          visibility: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["employee_document_category"]
          created_at?: string
          doc_type?: string
          employee_id: string
          expiry_date?: string | null
          file_name: string
          file_path: string
          id?: string
          issued_date?: string | null
          issuer?: string | null
          mime_type?: string | null
          notes?: string | null
          reference_number?: string | null
          size_bytes?: number | null
          source_envelope_id?: string | null
          tenant_id: string
          updated_at?: string
          uploaded_by?: string | null
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["employee_document_verification"]
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["employee_document_category"]
          created_at?: string
          doc_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          id?: string
          issued_date?: string | null
          issuer?: string | null
          mime_type?: string | null
          notes?: string | null
          reference_number?: string | null
          size_bytes?: number | null
          source_envelope_id?: string | null
          tenant_id?: string
          updated_at?: string
          uploaded_by?: string | null
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["employee_document_verification"]
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_documents_source_envelope_id_fkey"
            columns: ["source_envelope_id"]
            isOneToOne: false
            referencedRelation: "document_envelopes"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_duties: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          employee_id: string
          id: string
          is_active: boolean
          kpi_target: string | null
          sort_order: number
          tenant_id: string
          title: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          employee_id: string
          id?: string
          is_active?: boolean
          kpi_target?: string | null
          sort_order?: number
          tenant_id: string
          title: string
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          is_active?: boolean
          kpi_target?: string | null
          sort_order?: number
          tenant_id?: string
          title?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_duties_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_duties_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_event_links: {
        Row: {
          created_at: string
          from_event_id: string
          id: string
          relation: string
          to_event_id: string
        }
        Insert: {
          created_at?: string
          from_event_id: string
          id?: string
          relation?: string
          to_event_id: string
        }
        Update: {
          created_at?: string
          from_event_id?: string
          id?: string
          relation?: string
          to_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_event_links_from_event_id_fkey"
            columns: ["from_event_id"]
            isOneToOne: false
            referencedRelation: "employee_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_event_links_to_event_id_fkey"
            columns: ["to_event_id"]
            isOneToOne: false
            referencedRelation: "employee_events"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"]
          created_at: string
          created_by: string | null
          employee_id: string
          event_type: string
          id: string
          metadata: Json
          occurred_at: string
          severity: string | null
          source_id: string | null
          source_table: string | null
          summary: string | null
          tenant_id: string
          title: string
          visibility: Database["public"]["Enums"]["event_visibility"]
        }
        Insert: {
          category: Database["public"]["Enums"]["event_category"]
          created_at?: string
          created_by?: string | null
          employee_id: string
          event_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          severity?: string | null
          source_id?: string | null
          source_table?: string | null
          summary?: string | null
          tenant_id: string
          title: string
          visibility?: Database["public"]["Enums"]["event_visibility"]
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string
          created_by?: string | null
          employee_id?: string
          event_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          severity?: string | null
          source_id?: string | null
          source_table?: string | null
          summary?: string | null
          tenant_id?: string
          title?: string
          visibility?: Database["public"]["Enums"]["event_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "employee_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_holiday_override_audit: {
        Row: {
          action: string
          after_data: Json | null
          before_data: Json | null
          changed_at: string
          changed_by: string | null
          employee_id: string
          employee_overrides_after: Json | null
          employee_overrides_before: Json | null
          id: string
          tenant_id: string
        }
        Insert: {
          action: string
          after_data?: Json | null
          before_data?: Json | null
          changed_at?: string
          changed_by?: string | null
          employee_id: string
          employee_overrides_after?: Json | null
          employee_overrides_before?: Json | null
          id?: string
          tenant_id: string
        }
        Update: {
          action?: string
          after_data?: Json | null
          before_data?: Json | null
          changed_at?: string
          changed_by?: string | null
          employee_id?: string
          employee_overrides_after?: Json | null
          employee_overrides_before?: Json | null
          id?: string
          tenant_id?: string
        }
        Relationships: []
      }
      employee_holiday_overrides: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          employee_id: string
          holiday_date: string
          id: string
          is_paid: boolean
          name: string
          notes: string | null
          pay_multiplier: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          employee_id: string
          holiday_date: string
          id?: string
          is_paid?: boolean
          name: string
          notes?: string | null
          pay_multiplier?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string
          holiday_date?: string
          id?: string
          is_paid?: boolean
          name?: string
          notes?: string | null
          pay_multiplier?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_holiday_overrides_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_holiday_overrides_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_payroll_details: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_bsb: string | null
          bank_name: string | null
          contact_number: string | null
          created_at: string
          employee_id: string
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          super_fund_name: string | null
          super_member_number: string | null
          tenant_id: string
          tfn: string | null
          updated_at: string
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_bsb?: string | null
          bank_name?: string | null
          contact_number?: string | null
          created_at?: string
          employee_id: string
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          super_fund_name?: string | null
          super_member_number?: string | null
          tenant_id: string
          tfn?: string | null
          updated_at?: string
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_bsb?: string | null
          bank_name?: string | null
          contact_number?: string | null
          created_at?: string
          employee_id?: string
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          super_fund_name?: string | null
          super_member_number?: string | null
          tenant_id?: string
          tfn?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_payroll_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_payroll_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_payroll_details_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_super_choices: {
        Row: {
          created_at: string
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          member_number: string | null
          super_fund_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_id: string
          id?: string
          member_number?: string | null
          super_fund_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          member_number?: string | null
          super_fund_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_super_choices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_super_choices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_super_choices_super_fund_id_fkey"
            columns: ["super_fund_id"]
            isOneToOne: false
            referencedRelation: "super_funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_super_choices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_ytd_opening: {
        Row: {
          allowances: number
          created_at: string
          currency_code: string
          deductions: number
          employee_id: string
          financial_year: number
          gross_earnings: number
          id: string
          notes: string | null
          paye_tax: number
          reportable_fringe_benefits: number
          super_employee_voluntary: number
          super_guarantee: number
          super_salary_sacrifice: number
          taxable_earnings: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allowances?: number
          created_at?: string
          currency_code?: string
          deductions?: number
          employee_id: string
          financial_year: number
          gross_earnings?: number
          id?: string
          notes?: string | null
          paye_tax?: number
          reportable_fringe_benefits?: number
          super_employee_voluntary?: number
          super_guarantee?: number
          super_salary_sacrifice?: number
          taxable_earnings?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allowances?: number
          created_at?: string
          currency_code?: string
          deductions?: number
          employee_id?: string
          financial_year?: number
          gross_earnings?: number
          id?: string
          notes?: string | null
          paye_tax?: number
          reportable_fringe_benefits?: number
          super_employee_voluntary?: number
          super_guarantee?: number
          super_salary_sacrifice?: number
          taxable_earnings?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_ytd_opening_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_ytd_opening_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_ytd_opening_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          au_cessation_type: string | null
          au_country_code: string | null
          au_employment_basis: string | null
          au_income_stream_type: string | null
          au_residency_status: string | null
          au_stp_previous_bms_id: string | null
          au_super_fund_abn: string | null
          au_super_member_no: string | null
          au_tax_treatment_code: string | null
          au_tfn: string | null
          base_salary: number | null
          branch_id: string | null
          cessation_reason_code: string | null
          created_at: string
          currency_code: string | null
          current_pay_change_id: string | null
          department_id: string | null
          designation_id: string | null
          email: string
          employee_number: string
          employment_basis: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          first_name: string
          hire_date: string
          holiday_category_id: string | null
          hourly_rate: number | null
          id: string
          income_type: string | null
          job_title: string | null
          last_name: string
          manager_id: string | null
          pay_frequency: string | null
          phone: string | null
          state_region: string | null
          status: Database["public"]["Enums"]["employee_status"]
          tax_treatment_code: string | null
          tenant_id: string
          termination_date: string | null
          tfn_status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          au_cessation_type?: string | null
          au_country_code?: string | null
          au_employment_basis?: string | null
          au_income_stream_type?: string | null
          au_residency_status?: string | null
          au_stp_previous_bms_id?: string | null
          au_super_fund_abn?: string | null
          au_super_member_no?: string | null
          au_tax_treatment_code?: string | null
          au_tfn?: string | null
          base_salary?: number | null
          branch_id?: string | null
          cessation_reason_code?: string | null
          created_at?: string
          currency_code?: string | null
          current_pay_change_id?: string | null
          department_id?: string | null
          designation_id?: string | null
          email: string
          employee_number: string
          employment_basis?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          first_name: string
          hire_date: string
          holiday_category_id?: string | null
          hourly_rate?: number | null
          id?: string
          income_type?: string | null
          job_title?: string | null
          last_name: string
          manager_id?: string | null
          pay_frequency?: string | null
          phone?: string | null
          state_region?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          tax_treatment_code?: string | null
          tenant_id: string
          termination_date?: string | null
          tfn_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          au_cessation_type?: string | null
          au_country_code?: string | null
          au_employment_basis?: string | null
          au_income_stream_type?: string | null
          au_residency_status?: string | null
          au_stp_previous_bms_id?: string | null
          au_super_fund_abn?: string | null
          au_super_member_no?: string | null
          au_tax_treatment_code?: string | null
          au_tfn?: string | null
          base_salary?: number | null
          branch_id?: string | null
          cessation_reason_code?: string | null
          created_at?: string
          currency_code?: string | null
          current_pay_change_id?: string | null
          department_id?: string | null
          designation_id?: string | null
          email?: string
          employee_number?: string
          employment_basis?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          first_name?: string
          hire_date?: string
          holiday_category_id?: string | null
          hourly_rate?: number | null
          id?: string
          income_type?: string | null
          job_title?: string | null
          last_name?: string
          manager_id?: string | null
          pay_frequency?: string | null
          phone?: string | null
          state_region?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          tax_treatment_code?: string | null
          tenant_id?: string
          termination_date?: string | null
          tfn_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_current_pay_change_id_fkey"
            columns: ["current_pay_change_id"]
            isOneToOne: false
            referencedRelation: "pay_rate_changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_holiday_category_id_fkey"
            columns: ["holiday_category_id"]
            isOneToOne: false
            referencedRelation: "public_holiday_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_variation_approvals: {
        Row: {
          approver_id: string | null
          approver_role: string
          comment: string | null
          created_at: string
          decided_at: string | null
          decision: string | null
          id: string
          step_no: number
          variation_id: string
        }
        Insert: {
          approver_id?: string | null
          approver_role: string
          comment?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          id?: string
          step_no?: number
          variation_id: string
        }
        Update: {
          approver_id?: string | null
          approver_role?: string
          comment?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          id?: string
          step_no?: number
          variation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employment_variation_approvals_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "employment_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_variation_audit: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_name: string | null
          created_at: string
          details: Json
          id: string
          variation_id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json
          id?: string
          variation_id: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json
          id?: string
          variation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employment_variation_audit_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "employment_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_variations: {
        Row: {
          applied_at: string | null
          approved_at: string | null
          approver_id: string | null
          created_at: string
          current_snapshot: Json
          effective_date: string
          employee_id: string
          id: string
          notes: string | null
          proposed_changes: Json
          rejection_reason: string | null
          requested_by: string | null
          status: string
          tenant_id: string
          updated_at: string
          variation_type: string
        }
        Insert: {
          applied_at?: string | null
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          current_snapshot?: Json
          effective_date: string
          employee_id: string
          id?: string
          notes?: string | null
          proposed_changes?: Json
          rejection_reason?: string | null
          requested_by?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          variation_type: string
        }
        Update: {
          applied_at?: string | null
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          current_snapshot?: Json
          effective_date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          proposed_changes?: Json
          rejection_reason?: string | null
          requested_by?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          variation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "employment_variations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employment_variations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      event_access_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          employee_id: string | null
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string
          tenant_id: string
          was_confidential: boolean
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type: string
          tenant_id: string
          was_confidential?: boolean
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string
          was_confidential?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "event_access_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_access_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "event_access_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_approval_rules: {
        Row: {
          approver_id: string
          created_at: string
          department_id: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number
          notes: string | null
          priority: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approver_id: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number
          notes?: string | null
          priority?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approver_id?: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number
          notes?: string | null
          priority?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_approval_rules_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_approvals: {
        Row: {
          action: string
          approver_id: string
          claim_id: string
          comment: string | null
          created_at: string
          id: string
          tenant_id: string
        }
        Insert: {
          action: string
          approver_id: string
          claim_id: string
          comment?: string | null
          created_at?: string
          id?: string
          tenant_id: string
        }
        Update: {
          action?: string
          approver_id?: string
          claim_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_approvals_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "expense_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_approvals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          code: string | null
          created_at: string
          daily_limit: number | null
          description: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          monthly_limit: number | null
          name: string
          requires_receipt: boolean
          tax_code: string | null
          tax_rate: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          daily_limit?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          monthly_limit?: number | null
          name: string
          requires_receipt?: boolean
          tax_code?: string | null
          tax_rate?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          daily_limit?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          monthly_limit?: number | null
          name?: string
          requires_receipt?: boolean
          tax_code?: string | null
          tax_rate?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_claims: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency: string
          description: string | null
          employee_id: string
          id: string
          paid_at: string | null
          paid_by: string | null
          payment_reference: string | null
          recommendation_note: string | null
          recommended_at: string | null
          recommended_by: string | null
          reference_code: string | null
          rejected_reason: string | null
          status: Database["public"]["Enums"]["expense_claim_status"]
          submitted_at: string | null
          tenant_id: string
          title: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          employee_id: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          payment_reference?: string | null
          recommendation_note?: string | null
          recommended_at?: string | null
          recommended_by?: string | null
          reference_code?: string | null
          rejected_reason?: string | null
          status?: Database["public"]["Enums"]["expense_claim_status"]
          submitted_at?: string | null
          tenant_id: string
          title: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          employee_id?: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          payment_reference?: string | null
          recommendation_note?: string | null
          recommended_at?: string | null
          recommended_by?: string | null
          reference_code?: string | null
          rejected_reason?: string | null
          status?: Database["public"]["Enums"]["expense_claim_status"]
          submitted_at?: string | null
          tenant_id?: string
          title?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_claims_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_claims_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "expense_claims_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_lines: {
        Row: {
          amount: number
          category_id: string | null
          claim_id: string
          created_at: string
          currency: string
          description: string | null
          expense_date: string
          id: string
          merchant: string | null
          mileage_km: number | null
          receipt_path: string | null
          tax_amount: number | null
          tenant_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          claim_id: string
          created_at?: string
          currency?: string
          description?: string | null
          expense_date: string
          id?: string
          merchant?: string | null
          mileage_km?: number | null
          receipt_path?: string | null
          tax_amount?: number | null
          tenant_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          claim_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          expense_date?: string
          id?: string
          merchant?: string | null
          mileage_km?: number | null
          receipt_path?: string | null
          tax_amount?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_lines_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_lines_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "expense_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_lines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_question_templates: {
        Row: {
          change_note: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          is_current: boolean
          is_default: boolean
          name: string
          parent_template_id: string | null
          questions: Json
          tenant_id: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          change_note?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_current?: boolean
          is_default?: boolean
          name: string
          parent_template_id?: string | null
          questions?: Json
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          change_note?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_current?: boolean
          is_default?: boolean
          name?: string
          parent_template_id?: string | null
          questions?: Json
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "feedback_question_templates_parent_template_id_fkey"
            columns: ["parent_template_id"]
            isOneToOne: false
            referencedRelation: "feedback_question_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rates: {
        Row: {
          base_currency: string
          created_at: string
          created_by: string | null
          id: string
          quote_currency: string
          rate: number
          rate_date: string
          source: string
        }
        Insert: {
          base_currency: string
          created_at?: string
          created_by?: string | null
          id?: string
          quote_currency: string
          rate: number
          rate_date?: string
          source?: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          created_by?: string | null
          id?: string
          quote_currency?: string
          rate?: number
          rate_date?: string
          source?: string
        }
        Relationships: []
      }
      geofence_audit_log: {
        Row: {
          accuracy_m: number | null
          action: string
          actor_user_id: string | null
          created_at: string
          geofence_id: string | null
          id: string
          is_suspicious: boolean
          latitude: number | null
          longitude: number | null
          metadata: Json
          source: string | null
          suspicious_reason: string | null
          tenant_id: string
        }
        Insert: {
          accuracy_m?: number | null
          action: string
          actor_user_id?: string | null
          created_at?: string
          geofence_id?: string | null
          id?: string
          is_suspicious?: boolean
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          source?: string | null
          suspicious_reason?: string | null
          tenant_id: string
        }
        Update: {
          accuracy_m?: number | null
          action?: string
          actor_user_id?: string | null
          created_at?: string
          geofence_id?: string | null
          id?: string
          is_suspicious?: boolean
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          source?: string | null
          suspicious_reason?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofence_audit_log_geofence_id_fkey"
            columns: ["geofence_id"]
            isOneToOne: false
            referencedRelation: "sign_geofences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofence_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      geofence_reconciliation: {
        Row: {
          actor_user_id: string | null
          attendance_entry_id: string | null
          audit_log_id: string | null
          created_at: string
          details: Json
          employee_id: string | null
          event_time: string
          event_type: string
          geofence_id: string | null
          id: string
          mismatch_type: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          actor_user_id?: string | null
          attendance_entry_id?: string | null
          audit_log_id?: string | null
          created_at?: string
          details?: Json
          employee_id?: string | null
          event_time: string
          event_type: string
          geofence_id?: string | null
          id?: string
          mismatch_type: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          actor_user_id?: string | null
          attendance_entry_id?: string | null
          audit_log_id?: string | null
          created_at?: string
          details?: Json
          employee_id?: string | null
          event_time?: string
          event_type?: string
          geofence_id?: string | null
          id?: string
          mismatch_type?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofence_reconciliation_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "geofence_audit_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofence_reconciliation_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofence_reconciliation_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "geofence_reconciliation_geofence_id_fkey"
            columns: ["geofence_id"]
            isOneToOne: false
            referencedRelation: "sign_geofences"
            referencedColumns: ["id"]
          },
        ]
      }
      geofence_sim_traces: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          points: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          points?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          points?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      grievance_attachments: {
        Row: {
          created_at: string
          file_name: string
          grievance_id: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          tenant_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          grievance_id: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          tenant_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          grievance_id?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          tenant_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "grievance_attachments_grievance_id_fkey"
            columns: ["grievance_id"]
            isOneToOne: false
            referencedRelation: "grievances"
            referencedColumns: ["id"]
          },
        ]
      }
      grievance_comments: {
        Row: {
          author_id: string
          comment: string
          created_at: string
          grievance_id: string
          id: string
          is_internal: boolean
          tenant_id: string
        }
        Insert: {
          author_id: string
          comment: string
          created_at?: string
          grievance_id: string
          id?: string
          is_internal?: boolean
          tenant_id: string
        }
        Update: {
          author_id?: string
          comment?: string
          created_at?: string
          grievance_id?: string
          id?: string
          is_internal?: boolean
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grievance_comments_grievance_id_fkey"
            columns: ["grievance_id"]
            isOneToOne: false
            referencedRelation: "grievances"
            referencedColumns: ["id"]
          },
        ]
      }
      grievances: {
        Row: {
          against_employee_id: string | null
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          filer_employee_id: string | null
          filer_user_id: string
          id: string
          is_anonymous: boolean
          resolution: string | null
          resolved_at: string | null
          severity: string
          status: string
          subject: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          against_employee_id?: string | null
          assigned_to?: string | null
          category: string
          created_at?: string
          description: string
          filer_employee_id?: string | null
          filer_user_id: string
          id?: string
          is_anonymous?: boolean
          resolution?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          subject: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          against_employee_id?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          filer_employee_id?: string | null
          filer_user_id?: string
          id?: string
          is_anonymous?: boolean
          resolution?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          subject?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      holiday_category_dates: {
        Row: {
          category_id: string
          created_at: string
          holiday_date: string
          id: string
          is_paid: boolean
          name: string
          notes: string | null
          pay_multiplier: number | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          holiday_date: string
          id?: string
          is_paid?: boolean
          name: string
          notes?: string | null
          pay_multiplier?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          holiday_date?: string
          id?: string
          is_paid?: boolean
          name?: string
          notes?: string | null
          pay_multiplier?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "holiday_category_dates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "public_holiday_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      id_document_requests: {
        Row: {
          created_at: string
          document_type: string
          employee_id: string
          fulfilled_at: string | null
          id: string
          last_attempted_at: string | null
          last_send_error: string | null
          last_send_status: string
          next_retry_at: string | null
          notes: string | null
          requested_at: string
          requested_by: string | null
          send_attempts: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type: string
          employee_id: string
          fulfilled_at?: string | null
          id?: string
          last_attempted_at?: string | null
          last_send_error?: string | null
          last_send_status?: string
          next_retry_at?: string | null
          notes?: string | null
          requested_at?: string
          requested_by?: string | null
          send_attempts?: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          employee_id?: string
          fulfilled_at?: string | null
          id?: string
          last_attempted_at?: string | null
          last_send_error?: string | null
          last_send_status?: string
          next_retry_at?: string | null
          notes?: string | null
          requested_at?: string
          requested_by?: string | null
          send_attempts?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "id_document_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "id_document_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "id_document_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      id_request_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          from_status: string | null
          id: string
          metadata: Json
          request_id: string
          tenant_id: string
          to_status: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json
          request_id: string
          tenant_id: string
          to_status?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json
          request_id?: string
          tenant_id?: string
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "id_request_audit_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "id_document_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "id_request_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      in_app_notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          metadata: Json
          read_at: string | null
          tenant_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          metadata?: Json
          read_at?: string | null
          tenant_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          metadata?: Json
          read_at?: string | null
          tenant_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number
          project_id: string | null
          quantity: number
          sort_order: number
          tax_rate: number
          tenant_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total?: number
          project_id?: string | null
          quantity?: number
          sort_order?: number
          tax_rate?: number
          tenant_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          project_id?: string | null
          quantity?: number
          sort_order?: number
          tax_rate?: number
          tenant_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          client_id: string
          created_at: string
          created_by: string | null
          currency_code: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_at: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_total: number
          tenant_id: string
          terms: string | null
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          client_id: string
          created_at?: string
          created_by?: string | null
          currency_code: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          tenant_id: string
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          tenant_id?: string
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      job_tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          done: boolean
          done_at: string | null
          done_by: string | null
          id: string
          job_id: string
          sort_order: number
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          done?: boolean
          done_at?: string | null
          done_by?: string | null
          id?: string
          job_id: string
          sort_order?: number
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          done?: boolean
          done_at?: string | null
          done_by?: string | null
          id?: string
          job_id?: string
          sort_order?: number
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "job_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "client_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_article_views: {
        Row: {
          article_id: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          article_id: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          article_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_articles: {
        Row: {
          body_md: string
          category: string
          created_at: string
          created_by: string | null
          id: string
          published: boolean
          role_audience: string[]
          slug: string
          sort_order: number
          summary: string | null
          tags: string[]
          title: string
          updated_at: string
          video_url: string | null
          view_count: number
        }
        Insert: {
          body_md?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          role_audience?: string[]
          slug: string
          sort_order?: number
          summary?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          video_url?: string | null
          view_count?: number
        }
        Update: {
          body_md?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          role_audience?: string[]
          slug?: string
          sort_order?: number
          summary?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          video_url?: string | null
          view_count?: number
        }
        Relationships: []
      }
      kpi_review_cycles: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closed_notified_at: string | null
          created_at: string
          created_by: string | null
          ends_on: string
          id: string
          label: string
          last_reminder_sent_at: string | null
          open_notified_at: string | null
          opened_at: string | null
          opened_by: string | null
          reminder_days_before: number
          starts_on: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closed_notified_at?: string | null
          created_at?: string
          created_by?: string | null
          ends_on: string
          id?: string
          label: string
          last_reminder_sent_at?: string | null
          open_notified_at?: string | null
          opened_at?: string | null
          opened_by?: string | null
          reminder_days_before?: number
          starts_on: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closed_notified_at?: string | null
          created_at?: string
          created_by?: string | null
          ends_on?: string
          id?: string
          label?: string
          last_reminder_sent_at?: string | null
          open_notified_at?: string | null
          opened_at?: string | null
          opened_by?: string | null
          reminder_days_before?: number
          starts_on?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          company: string
          company_size: string | null
          country: string | null
          created_at: string
          current_payroll_system: string | null
          employee_count: number | null
          full_name: string
          id: string
          message: string | null
          notes: string | null
          phone: string | null
          role: string | null
          source: string | null
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          work_email: string
        }
        Insert: {
          company: string
          company_size?: string | null
          country?: string | null
          created_at?: string
          current_payroll_system?: string | null
          employee_count?: number | null
          full_name: string
          id?: string
          message?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          work_email: string
        }
        Update: {
          company?: string
          company_size?: string | null
          country?: string | null
          created_at?: string
          current_payroll_system?: string | null
          employee_count?: number | null
          full_name?: string
          id?: string
          message?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          work_email?: string
        }
        Relationships: []
      }
      leave_accrual_log: {
        Row: {
          actor_id: string | null
          amount: number
          created_at: string
          employee_id: string
          id: string
          kind: string
          leave_type_id: string
          period_key: string
          reason: string | null
          tenant_id: string
        }
        Insert: {
          actor_id?: string | null
          amount: number
          created_at?: string
          employee_id: string
          id?: string
          kind: string
          leave_type_id: string
          period_key: string
          reason?: string | null
          tenant_id: string
        }
        Update: {
          actor_id?: string | null
          amount?: number
          created_at?: string
          employee_id?: string
          id?: string
          kind?: string
          leave_type_id?: string
          period_key?: string
          reason?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      leave_approval_routes: {
        Row: {
          approver_role: string | null
          approver_user_id: string | null
          created_at: string
          escalate_after_hours: number
          id: string
          is_active: boolean
          leave_type_id: string | null
          notes: string | null
          tenant_id: string
          tier: number
          updated_at: string
        }
        Insert: {
          approver_role?: string | null
          approver_user_id?: string | null
          created_at?: string
          escalate_after_hours?: number
          id?: string
          is_active?: boolean
          leave_type_id?: string | null
          notes?: string | null
          tenant_id: string
          tier: number
          updated_at?: string
        }
        Update: {
          approver_role?: string | null
          approver_user_id?: string | null
          created_at?: string
          escalate_after_hours?: number
          id?: string
          is_active?: boolean
          leave_type_id?: string | null
          notes?: string | null
          tenant_id?: string
          tier?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_approval_routes_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          accrued_days: number
          carried_over_days: number
          created_at: string
          employee_id: string
          id: string
          leave_type_id: string
          opening_balance: number | null
          opening_balance_locked_at: string | null
          pending_days: number
          tenant_id: string
          updated_at: string
          used_days: number
          year: number
        }
        Insert: {
          accrued_days?: number
          carried_over_days?: number
          created_at?: string
          employee_id: string
          id?: string
          leave_type_id: string
          opening_balance?: number | null
          opening_balance_locked_at?: string | null
          pending_days?: number
          tenant_id: string
          updated_at?: string
          used_days?: number
          year: number
        }
        Update: {
          accrued_days?: number
          carried_over_days?: number
          created_at?: string
          employee_id?: string
          id?: string
          leave_type_id?: string
          opening_balance?: number | null
          opening_balance_locked_at?: string | null
          pending_days?: number
          tenant_id?: string
          updated_at?: string
          used_days?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          current_tier: number
          days: number
          employee_id: string
          end_date: string
          half_day_end: boolean
          half_day_start: boolean
          id: string
          leave_type_id: string
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_request_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          current_tier?: number
          days: number
          employee_id: string
          end_date: string
          half_day_end?: boolean
          half_day_start?: boolean
          id?: string
          leave_type_id: string
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_request_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          current_tier?: number
          days?: number
          employee_id?: string
          end_date?: string
          half_day_end?: boolean
          half_day_start?: boolean
          id?: string
          leave_type_id?: string
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_request_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          accrual_per_month: number
          allow_carry_over: boolean
          allow_half_day: boolean
          annual_quota_days: number
          branch_id: string | null
          code: string
          color: string
          created_at: string
          id: string
          is_active: boolean
          is_paid: boolean
          max_carry_over_days: number
          name: string
          requires_approval: boolean
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accrual_per_month?: number
          allow_carry_over?: boolean
          allow_half_day?: boolean
          annual_quota_days?: number
          branch_id?: string | null
          code: string
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_paid?: boolean
          max_carry_over_days?: number
          name: string
          requires_approval?: boolean
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accrual_per_month?: number
          allow_carry_over?: boolean
          allow_half_day?: boolean
          annual_quota_days?: number
          branch_id?: string | null
          code?: string
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_paid?: boolean
          max_carry_over_days?: number
          name?: string
          requires_approval?: boolean
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_quick_access: {
        Row: {
          created_at: string
          href: string
          icon: string | null
          id: string
          key: string
          label: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          href: string
          icon?: string | null
          id?: string
          key: string
          label: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          href?: string
          icon?: string | null
          id?: string
          key?: string
          label?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      medical_attachments: {
        Row: {
          created_at: string
          file_name: string
          id: string
          incident_id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          tenant_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          incident_id: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          tenant_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          incident_id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          tenant_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_attachments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "medical_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_cases: {
        Row: {
          assigned_to: string | null
          case_number: string | null
          closed_at: string | null
          closed_by: string | null
          confidential: boolean
          created_at: string
          description: string
          due_date: string | null
          employee_id: string
          id: string
          incident_id: string | null
          opened_by: string | null
          outcome: string | null
          severity: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_number?: string | null
          closed_at?: string | null
          closed_by?: string | null
          confidential?: boolean
          created_at?: string
          description: string
          due_date?: string | null
          employee_id: string
          id?: string
          incident_id?: string | null
          opened_by?: string | null
          outcome?: string | null
          severity?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_number?: string | null
          closed_at?: string | null
          closed_by?: string | null
          confidential?: boolean
          created_at?: string
          description?: string
          due_date?: string | null
          employee_id?: string
          id?: string
          incident_id?: string | null
          opened_by?: string | null
          outcome?: string | null
          severity?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_cases_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_cases_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "medical_cases_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "medical_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_cases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_incidents: {
        Row: {
          branch_id: string | null
          confidential: boolean
          created_at: string
          created_by: string | null
          description: string
          employee_id: string
          id: string
          incident_type: string
          location: string | null
          occurred_at: string
          reported_to_authority: boolean
          requires_case: boolean
          severity: string
          tenant_id: string
          treatment_notes: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          confidential?: boolean
          created_at?: string
          created_by?: string | null
          description: string
          employee_id: string
          id?: string
          incident_type: string
          location?: string | null
          occurred_at?: string
          reported_to_authority?: boolean
          requires_case?: boolean
          severity?: string
          tenant_id: string
          treatment_notes?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          confidential?: boolean
          created_at?: string
          created_by?: string | null
          description?: string
          employee_id?: string
          id?: string
          incident_type?: string
          location?: string | null
          occurred_at?: string
          reported_to_authority?: boolean
          requires_case?: boolean
          severity?: string
          tenant_id?: string
          treatment_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_incidents_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_incidents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_incidents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "medical_incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_email_challenges: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          purpose: string
          user_id: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          purpose: string
          user_id: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          purpose?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          notify_leave_cancelled: boolean
          notify_leave_decision: boolean
          notify_leave_submitted: boolean
          notify_onboarding_overdue: boolean
          notify_onboarding_task: boolean
          notify_review_acknowledgment: boolean
          notify_review_calibration: boolean
          notify_review_manager_pending: boolean
          notify_review_self_pending: boolean
          notify_timesheet: boolean
          review_reminder_business_days_only: boolean
          review_reminder_min_interval_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          notify_leave_cancelled?: boolean
          notify_leave_decision?: boolean
          notify_leave_submitted?: boolean
          notify_onboarding_overdue?: boolean
          notify_onboarding_task?: boolean
          notify_review_acknowledgment?: boolean
          notify_review_calibration?: boolean
          notify_review_manager_pending?: boolean
          notify_review_self_pending?: boolean
          notify_timesheet?: boolean
          review_reminder_business_days_only?: boolean
          review_reminder_min_interval_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          notify_leave_cancelled?: boolean
          notify_leave_decision?: boolean
          notify_leave_submitted?: boolean
          notify_onboarding_overdue?: boolean
          notify_onboarding_task?: boolean
          notify_review_acknowledgment?: boolean
          notify_review_calibration?: boolean
          notify_review_manager_pending?: boolean
          notify_review_self_pending?: boolean
          notify_timesheet?: boolean
          review_reminder_business_days_only?: boolean
          review_reminder_min_interval_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      np_payroll_wizard_runs: {
        Row: {
          cit_percent: number
          created_at: string
          festival_month: string
          fiscal_year: string
          id: string
          inputs: Json
          marital_default: string
          pf_election: string
          remittance_percent: number
          run_by: string | null
          ssf_enrolled: boolean
          tenant_id: string
        }
        Insert: {
          cit_percent?: number
          created_at?: string
          festival_month?: string
          fiscal_year?: string
          id?: string
          inputs?: Json
          marital_default?: string
          pf_election?: string
          remittance_percent?: number
          run_by?: string | null
          ssf_enrolled?: boolean
          tenant_id: string
        }
        Update: {
          cit_percent?: number
          created_at?: string
          festival_month?: string
          fiscal_year?: string
          id?: string
          inputs?: Json
          marital_default?: string
          pf_election?: string
          remittance_percent?: number
          run_by?: string | null
          ssf_enrolled?: boolean
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "np_payroll_wizard_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_cases: {
        Row: {
          closed_at: string | null
          confidential: boolean
          created_at: string
          created_by: string | null
          employee_id: string
          exit_interview_at: string | null
          exit_interview_by: string | null
          exit_interview_notes: string | null
          exit_interview_rating: number | null
          final_pay_processed_on: string | null
          final_pay_status: string | null
          hr_owner_id: string | null
          id: string
          knowledge_transfer_notes: string | null
          last_working_day: string | null
          manager_id: string | null
          metadata: Json
          notice_given_on: string | null
          reason: Database["public"]["Enums"]["offboarding_reason"]
          reason_notes: string | null
          rehire_eligible: boolean | null
          status: Database["public"]["Enums"]["offboarding_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          confidential?: boolean
          created_at?: string
          created_by?: string | null
          employee_id: string
          exit_interview_at?: string | null
          exit_interview_by?: string | null
          exit_interview_notes?: string | null
          exit_interview_rating?: number | null
          final_pay_processed_on?: string | null
          final_pay_status?: string | null
          hr_owner_id?: string | null
          id?: string
          knowledge_transfer_notes?: string | null
          last_working_day?: string | null
          manager_id?: string | null
          metadata?: Json
          notice_given_on?: string | null
          reason?: Database["public"]["Enums"]["offboarding_reason"]
          reason_notes?: string | null
          rehire_eligible?: boolean | null
          status?: Database["public"]["Enums"]["offboarding_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          confidential?: boolean
          created_at?: string
          created_by?: string | null
          employee_id?: string
          exit_interview_at?: string | null
          exit_interview_by?: string | null
          exit_interview_notes?: string | null
          exit_interview_rating?: number | null
          final_pay_processed_on?: string | null
          final_pay_status?: string | null
          hr_owner_id?: string | null
          id?: string
          knowledge_transfer_notes?: string | null
          last_working_day?: string | null
          manager_id?: string | null
          metadata?: Json
          notice_given_on?: string | null
          reason?: Database["public"]["Enums"]["offboarding_reason"]
          reason_notes?: string | null
          rehire_eligible?: boolean | null
          status?: Database["public"]["Enums"]["offboarding_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      offboarding_checklist_items: {
        Row: {
          asset_assignment_id: string | null
          assigned_to: string | null
          case_id: string
          category: string
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_blocking: boolean
          owner_role: string
          sort_order: number
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          asset_assignment_id?: string | null
          assigned_to?: string | null
          case_id: string
          category?: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_blocking?: boolean
          owner_role?: string
          sort_order?: number
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          asset_assignment_id?: string | null
          assigned_to?: string | null
          case_id?: string
          category?: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_blocking?: boolean
          owner_role?: string
          sort_order?: number
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_checklist_items_asset_assignment_id_fkey"
            columns: ["asset_assignment_id"]
            isOneToOne: false
            referencedRelation: "asset_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_checklist_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "offboarding_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_checklist_template_items: {
        Row: {
          category: string
          created_at: string
          due_offset_days: number
          id: string
          is_blocking: boolean
          owner_role: string
          sort_order: number
          template_id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          due_offset_days?: number
          id?: string
          is_blocking?: boolean
          owner_role?: string
          sort_order?: number
          template_id: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          due_offset_days?: number
          id?: string
          is_blocking?: boolean
          owner_role?: string
          sort_order?: number
          template_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "offboarding_checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_checklist_template_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_checklist_templates: {
        Row: {
          branch_id: string | null
          country_code: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          employment_type: string | null
          id: string
          is_active: boolean
          is_default: boolean
          is_system_seed: boolean
          name: string
          priority: number
          reason: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          is_system_seed?: boolean
          name: string
          priority?: number
          reason?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          is_system_seed?: boolean
          name?: string
          priority?: number
          reason?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_checklist_templates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_checklist_templates_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_checklist_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_comms_removal: {
        Row: {
          attestation_signature: string | null
          attested_at: string | null
          attested_by: string | null
          case_id: string
          channel: string
          channel_label: string
          created_at: string
          due_date: string | null
          escalate_after_days: number
          evidence_url: string | null
          id: string
          is_mandatory: boolean
          last_reminder_at: string | null
          notes: string | null
          reminder_count: number
          reminder_interval_days: number
          removed: boolean
          removed_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attestation_signature?: string | null
          attested_at?: string | null
          attested_by?: string | null
          case_id: string
          channel: string
          channel_label: string
          created_at?: string
          due_date?: string | null
          escalate_after_days?: number
          evidence_url?: string | null
          id?: string
          is_mandatory?: boolean
          last_reminder_at?: string | null
          notes?: string | null
          reminder_count?: number
          reminder_interval_days?: number
          removed?: boolean
          removed_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attestation_signature?: string | null
          attested_at?: string | null
          attested_by?: string | null
          case_id?: string
          channel?: string
          channel_label?: string
          created_at?: string
          due_date?: string | null
          escalate_after_days?: number
          evidence_url?: string | null
          id?: string
          is_mandatory?: boolean
          last_reminder_at?: string | null
          notes?: string | null
          reminder_count?: number
          reminder_interval_days?: number
          removed?: boolean
          removed_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_comms_removal_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "offboarding_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_comms_removal_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_comms_removal_audit: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_name: string | null
          after: Json
          before: Json
          case_id: string
          channel: string
          comms_row_id: string
          created_at: string
          id: string
          tenant_id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          after?: Json
          before?: Json
          case_id: string
          channel: string
          comms_row_id: string
          created_at?: string
          id?: string
          tenant_id: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          after?: Json
          before?: Json
          case_id?: string
          channel?: string
          comms_row_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
        }
        Relationships: []
      }
      offboarding_comms_removal_audit_archive: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_name: string | null
          after: Json
          before: Json
          case_id: string
          channel: string
          comms_row_id: string
          created_at: string
          id: string
          tenant_id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          after?: Json
          before?: Json
          case_id: string
          channel: string
          comms_row_id: string
          created_at?: string
          id?: string
          tenant_id: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          after?: Json
          before?: Json
          case_id?: string
          channel?: string
          comms_row_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
        }
        Relationships: []
      }
      offboarding_reminder_state: {
        Row: {
          alert_count: number
          case_id: string
          created_at: string
          last_alert_date: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          alert_count?: number
          case_id: string
          created_at?: string
          last_alert_date?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          alert_count?: number
          case_id?: string
          created_at?: string
          last_alert_date?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_reminder_state_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "offboarding_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          checklist_id: string
          created_at: string
          due_date: string | null
          employee_id: string
          id: string
          last_reminder_at: string | null
          metadata: Json
          notes: string | null
          reminder_count: number
          signed_off_at: string | null
          signed_off_by: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          checklist_id: string
          created_at?: string
          due_date?: string | null
          employee_id: string
          id?: string
          last_reminder_at?: string | null
          metadata?: Json
          notes?: string | null
          reminder_count?: number
          signed_off_at?: string | null
          signed_off_by?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          checklist_id?: string
          created_at?: string
          due_date?: string | null
          employee_id?: string
          id?: string
          last_reminder_at?: string | null
          metadata?: Json
          notes?: string | null
          reminder_count?: number
          signed_off_at?: string | null
          signed_off_by?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_assignments_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "onboarding_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      onboarding_checklist_template_courses: {
        Row: {
          course_id: string
          created_at: string
          due_offset_days: number
          id: string
          required: boolean
          sort_order: number
          template_id: string
          tenant_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          due_offset_days?: number
          id?: string
          required?: boolean
          sort_order?: number
          template_id: string
          tenant_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          due_offset_days?: number
          id?: string
          required?: boolean
          sort_order?: number
          template_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklist_template_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklist_template_courses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklist_template_courses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_checklist_template_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          due_offset_days: number
          id: string
          owner_role: string
          required: boolean
          sort_order: number
          template_id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          due_offset_days?: number
          id?: string
          owner_role?: string
          required?: boolean
          sort_order?: number
          template_id: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          due_offset_days?: number
          id?: string
          owner_role?: string
          required?: boolean
          sort_order?: number
          template_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklist_template_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_checklist_templates: {
        Row: {
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          role_target: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          role_target?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          role_target?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklist_templates_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklist_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_checklists: {
        Row: {
          branch_id: string | null
          country_code: string | null
          created_at: string
          department_id: string | null
          description: string | null
          employment_type: string | null
          id: string
          is_default: boolean
          is_system_seed: boolean
          items: Json
          name: string
          priority: number
          stages: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          country_code?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          is_default?: boolean
          is_system_seed?: boolean
          items?: Json
          name: string
          priority?: number
          stages?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          country_code?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          is_default?: boolean
          is_system_seed?: boolean
          items?: Json
          name?: string
          priority?: number
          stages?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklists_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklists_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_control_room_audit: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_name: string | null
          assignment_id: string
          created_at: string
          details: Json
          employee_id: string | null
          id: string
          task_id: string | null
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          assignment_id: string
          created_at?: string
          details?: Json
          employee_id?: string | null
          id?: string
          task_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          assignment_id?: string
          created_at?: string
          details?: Json
          employee_id?: string | null
          id?: string
          task_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_control_room_audit_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "onboarding_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_control_room_audit_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "onboarding_control_room_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_control_room_audit_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_control_room_audit_archive: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_name: string | null
          assignment_id: string
          created_at: string
          details: Json
          employee_id: string | null
          id: string
          task_id: string | null
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          assignment_id: string
          created_at?: string
          details?: Json
          employee_id?: string | null
          id?: string
          task_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          assignment_id?: string
          created_at?: string
          details?: Json
          employee_id?: string | null
          id?: string
          task_id?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      onboarding_control_room_tasks: {
        Row: {
          assigned_to: string | null
          assignment_id: string
          attestation_required: boolean
          attestation_signature: string | null
          attestation_text: string | null
          attested_at: string | null
          attested_by: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          escalate_after_days: number
          evidence_uploaded_at: string | null
          evidence_uploaded_by: string | null
          evidence_url: string | null
          id: string
          is_statutory: boolean
          last_reminder_at: string | null
          notes: string | null
          owner_role: string
          reminder_count: number
          reminder_interval_days: number
          sort_order: number
          source_country: string | null
          status: string
          title: string
          updated_at: string
          verified_at: string | null
          verifier_id: string | null
          verifier_notes: string | null
          verifier_role: string | null
        }
        Insert: {
          assigned_to?: string | null
          assignment_id: string
          attestation_required?: boolean
          attestation_signature?: string | null
          attestation_text?: string | null
          attested_at?: string | null
          attested_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          escalate_after_days?: number
          evidence_uploaded_at?: string | null
          evidence_uploaded_by?: string | null
          evidence_url?: string | null
          id?: string
          is_statutory?: boolean
          last_reminder_at?: string | null
          notes?: string | null
          owner_role: string
          reminder_count?: number
          reminder_interval_days?: number
          sort_order?: number
          source_country?: string | null
          status?: string
          title: string
          updated_at?: string
          verified_at?: string | null
          verifier_id?: string | null
          verifier_notes?: string | null
          verifier_role?: string | null
        }
        Update: {
          assigned_to?: string | null
          assignment_id?: string
          attestation_required?: boolean
          attestation_signature?: string | null
          attestation_text?: string | null
          attested_at?: string | null
          attested_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          escalate_after_days?: number
          evidence_uploaded_at?: string | null
          evidence_uploaded_by?: string | null
          evidence_url?: string | null
          id?: string
          is_statutory?: boolean
          last_reminder_at?: string | null
          notes?: string | null
          owner_role?: string
          reminder_count?: number
          reminder_interval_days?: number
          sort_order?: number
          source_country?: string | null
          status?: string
          title?: string
          updated_at?: string
          verified_at?: string | null
          verifier_id?: string | null
          verifier_notes?: string | null
          verifier_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_control_room_tasks_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "onboarding_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_default_assignments: {
        Row: {
          checklist_id: string
          created_at: string
          created_by: string | null
          department_id: string | null
          due_offset_days: number
          id: string
          is_active: boolean
          job_title: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          checklist_id: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          due_offset_days?: number
          id?: string
          is_active?: boolean
          job_title?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          checklist_id?: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          due_offset_days?: number
          id?: string
          is_active?: boolean
          job_title?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_default_assignments_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "onboarding_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_default_assignments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          approval_notes: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          checklist_id: string
          completed_at: string
          completed_by: string | null
          employee_id: string
          id: string
          item_key: string
          profile_section: string | null
          tenant_id: string
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          checklist_id: string
          completed_at?: string
          completed_by?: string | null
          employee_id: string
          id?: string
          item_key: string
          profile_section?: string | null
          tenant_id: string
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          checklist_id?: string
          completed_at?: string
          completed_by?: string | null
          employee_id?: string
          id?: string
          item_key?: string
          profile_section?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      org_trial_invitation_audit: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          invitation_id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          invitation_id: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          invitation_id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "org_trial_invitation_audit_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "org_trial_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_trial_invitations: {
        Row: {
          contact_name: string | null
          country_code: string | null
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          notes: string | null
          org_name: string
          redeemed_at: string | null
          redeemed_by: string | null
          redeemed_tenant_id: string | null
          status: string
          token: string
          trial_days: number
          updated_at: string
        }
        Insert: {
          contact_name?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          notes?: string | null
          org_name: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          redeemed_tenant_id?: string | null
          status?: string
          token?: string
          trial_days?: number
          updated_at?: string
        }
        Update: {
          contact_name?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          notes?: string | null
          org_name?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          redeemed_tenant_id?: string | null
          status?: string
          token?: string
          trial_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_trial_invitations_redeemed_tenant_id_fkey"
            columns: ["redeemed_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_setup_progress: {
        Row: {
          branding_done: boolean
          completed_at: string | null
          created_at: string
          defaults_done: boolean
          departments_done: boolean
          details_done: boolean
          invites_done: boolean
          last_reminder_at: string | null
          reminder_count: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branding_done?: boolean
          completed_at?: string | null
          created_at?: string
          defaults_done?: boolean
          departments_done?: boolean
          details_done?: boolean
          invites_done?: boolean
          last_reminder_at?: string | null
          reminder_count?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branding_done?: boolean
          completed_at?: string | null
          created_at?: string
          defaults_done?: boolean
          departments_done?: boolean
          details_done?: boolean
          invites_done?: boolean
          last_reminder_at?: string | null
          reminder_count?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      overtime_penalty_rates: {
        Row: {
          applies_to: string
          code: string
          country_code: string
          created_at: string
          description: string | null
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean
          name: string
          rate_multiplier: number
          updated_at: string
        }
        Insert: {
          applies_to: string
          code: string
          country_code: string
          created_at?: string
          description?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name: string
          rate_multiplier: number
          updated_at?: string
        }
        Update: {
          applies_to?: string
          code?: string
          country_code?: string
          created_at?: string
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name?: string
          rate_multiplier?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "overtime_penalty_rates_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      pay_rate_changes: {
        Row: {
          created_at: string
          currency_code: string
          decided_at: string | null
          decided_by: string | null
          decision_notes: string | null
          effective_date: string
          employee_id: string
          from_amount: number | null
          id: string
          notes: string | null
          pay_frequency: string
          promotion_id: string | null
          proposed_at: string
          proposed_by: string | null
          reason: Database["public"]["Enums"]["pay_rate_reason"]
          status: Database["public"]["Enums"]["pay_rate_status"]
          tenant_id: string
          to_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          effective_date: string
          employee_id: string
          from_amount?: number | null
          id?: string
          notes?: string | null
          pay_frequency?: string
          promotion_id?: string | null
          proposed_at?: string
          proposed_by?: string | null
          reason?: Database["public"]["Enums"]["pay_rate_reason"]
          status?: Database["public"]["Enums"]["pay_rate_status"]
          tenant_id: string
          to_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          effective_date?: string
          employee_id?: string
          from_amount?: number | null
          id?: string
          notes?: string | null
          pay_frequency?: string
          promotion_id?: string | null
          proposed_at?: string
          proposed_by?: string | null
          reason?: Database["public"]["Enums"]["pay_rate_reason"]
          status?: Database["public"]["Enums"]["pay_rate_status"]
          tenant_id?: string
          to_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pay_rate_changes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_rate_changes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "pay_rate_changes_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_rate_changes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_components: {
        Row: {
          calc_type: string
          code: string
          created_at: string
          department_id: string | null
          id: string
          is_active: boolean
          is_taxable: boolean
          kind: string
          label: string
          notes: string | null
          ote_eligible: boolean
          rate: number
          show_on_payslip: boolean
          sort_order: number
          stp2_category: string | null
          super_eligible: boolean
          tenant_id: string
          updated_at: string
        }
        Insert: {
          calc_type: string
          code: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          is_taxable?: boolean
          kind: string
          label: string
          notes?: string | null
          ote_eligible?: boolean
          rate?: number
          show_on_payslip?: boolean
          sort_order?: number
          stp2_category?: string | null
          super_eligible?: boolean
          tenant_id: string
          updated_at?: string
        }
        Update: {
          calc_type?: string
          code?: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          is_taxable?: boolean
          kind?: string
          label?: string
          notes?: string | null
          ote_eligible?: boolean
          rate?: number
          show_on_payslip?: boolean
          sort_order?: number
          stp2_category?: string | null
          super_eligible?: boolean
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_components_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_components_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_payslips: {
        Row: {
          allowances: number
          created_at: string
          currency_code: string
          deductions: number
          employee_contributions: number
          employee_id: string
          employer_contributions: number
          gross: number
          id: string
          income_tax: number
          lines: Json
          net_pay: number
          run_id: string
          taxable_base: number
          template_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allowances?: number
          created_at?: string
          currency_code: string
          deductions?: number
          employee_contributions?: number
          employee_id: string
          employer_contributions?: number
          gross?: number
          id?: string
          income_tax?: number
          lines?: Json
          net_pay?: number
          run_id: string
          taxable_base?: number
          template_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allowances?: number
          created_at?: string
          currency_code?: string
          deductions?: number
          employee_contributions?: number
          employee_id?: string
          employer_contributions?: number
          gross?: number
          id?: string
          income_tax?: number
          lines?: Json
          net_pay?: number
          run_id?: string
          taxable_base?: number
          template_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_payslips_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          base_currency_code: string
          computed_at: string | null
          country_code: string
          created_at: string
          created_by: string | null
          currency_code: string
          fx_rate: number
          id: string
          notes: string | null
          pay_date: string
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["payroll_run_status"]
          submitted_at: string | null
          submitted_by: string | null
          template_id: string | null
          tenant_id: string
          totals: Json
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          base_currency_code: string
          computed_at?: string | null
          country_code: string
          created_at?: string
          created_by?: string | null
          currency_code: string
          fx_rate?: number
          id?: string
          notes?: string | null
          pay_date: string
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["payroll_run_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          template_id?: string | null
          tenant_id: string
          totals?: Json
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          base_currency_code?: string
          computed_at?: string | null
          country_code?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          fx_rate?: number
          id?: string
          notes?: string | null
          pay_date?: string
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["payroll_run_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          template_id?: string | null
          tenant_id?: string
          totals?: Json
          updated_at?: string
        }
        Relationships: []
      }
      payroll_tax_rules: {
        Row: {
          country_code: string
          created_at: string
          created_by: string | null
          fy_label: string
          id: string
          is_active: boolean
          is_draft: boolean
          name: string
          payload: Json
          rule_type: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          created_by?: string | null
          fy_label: string
          id?: string
          is_active?: boolean
          is_draft?: boolean
          name: string
          payload?: Json
          rule_type: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          created_by?: string | null
          fy_label?: string
          id?: string
          is_active?: boolean
          is_draft?: boolean
          name?: string
          payload?: Json
          rule_type?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      payroll_underpayment_findings: {
        Row: {
          award_hourly_rate: number
          casual: boolean
          classification_id: string | null
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          notes: string | null
          ordinary_hours: number
          paid_hourly_rate: number
          paid_ordinary_earnings: number
          pay_date: string
          payslip_id: string
          resolved_at: string | null
          resolved_by: string | null
          run_id: string
          shortfall_per_hour: number
          shortfall_total: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          award_hourly_rate: number
          casual?: boolean
          classification_id?: string | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          ordinary_hours: number
          paid_hourly_rate: number
          paid_ordinary_earnings: number
          pay_date: string
          payslip_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          run_id: string
          shortfall_per_hour: number
          shortfall_total: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          award_hourly_rate?: number
          casual?: boolean
          classification_id?: string | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          ordinary_hours?: number
          paid_hourly_rate?: number
          paid_ordinary_earnings?: number
          pay_date?: string
          payslip_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          run_id?: string
          shortfall_per_hour?: number
          shortfall_total?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_underpayment_findings_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "award_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_underpayment_findings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_underpayment_findings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "payroll_underpayment_findings_payslip_id_fkey"
            columns: ["payslip_id"]
            isOneToOne: true
            referencedRelation: "payroll_payslips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_underpayment_findings_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_underpayment_findings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payslip_line_items: {
        Row: {
          calc_type: string
          category: string
          code: string
          component_id: string | null
          created_at: string
          formula: string | null
          id: string
          is_taxable: boolean
          is_visible: boolean
          label: string
          rate: number | null
          sort_order: number
          template_id: string
          updated_at: string
        }
        Insert: {
          calc_type?: string
          category: string
          code: string
          component_id?: string | null
          created_at?: string
          formula?: string | null
          id?: string
          is_taxable?: boolean
          is_visible?: boolean
          label: string
          rate?: number | null
          sort_order?: number
          template_id: string
          updated_at?: string
        }
        Update: {
          calc_type?: string
          category?: string
          code?: string
          component_id?: string | null
          created_at?: string
          formula?: string | null
          id?: string
          is_taxable?: boolean
          is_visible?: boolean
          label?: string
          rate?: number | null
          sort_order?: number
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payslip_line_items_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "payroll_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslip_line_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "payslip_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payslip_templates: {
        Row: {
          country_code: string
          created_at: string
          created_by: string | null
          currency_code: string
          currency_position: string
          date_format: string
          effective_from: string | null
          effective_to: string | null
          footer_html: string | null
          header_html: string | null
          id: string
          is_active: boolean
          is_default: boolean
          locale: string
          name: string
          number_format: Json
          parent_template_id: string | null
          published_at: string | null
          published_by: string | null
          show_employer_contributions: boolean
          show_ytd: boolean
          status: Database["public"]["Enums"]["payslip_template_status"]
          updated_at: string
          version: number
        }
        Insert: {
          country_code: string
          created_at?: string
          created_by?: string | null
          currency_code: string
          currency_position?: string
          date_format?: string
          effective_from?: string | null
          effective_to?: string | null
          footer_html?: string | null
          header_html?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          locale?: string
          name: string
          number_format?: Json
          parent_template_id?: string | null
          published_at?: string | null
          published_by?: string | null
          show_employer_contributions?: boolean
          show_ytd?: boolean
          status?: Database["public"]["Enums"]["payslip_template_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          country_code?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          currency_position?: string
          date_format?: string
          effective_from?: string | null
          effective_to?: string | null
          footer_html?: string | null
          header_html?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          locale?: string
          name?: string
          number_format?: Json
          parent_template_id?: string | null
          published_at?: string | null
          published_by?: string | null
          show_employer_contributions?: boolean
          show_ytd?: boolean
          status?: Database["public"]["Enums"]["payslip_template_status"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "payslip_templates_parent_template_id_fkey"
            columns: ["parent_template_id"]
            isOneToOne: false
            referencedRelation: "payslip_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_goals: {
        Row: {
          created_at: string
          cycle_id: string | null
          description: string | null
          due_date: string | null
          employee_id: string
          id: string
          progress: number
          status: Database["public"]["Enums"]["goal_status"]
          tenant_id: string
          title: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          cycle_id?: string | null
          description?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["goal_status"]
          tenant_id: string
          title: string
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          cycle_id?: string | null
          description?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["goal_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      performance_reviews: {
        Row: {
          acknowledged_at: string | null
          acknowledgment_comments: string | null
          calibrated_at: string | null
          calibrated_by: string | null
          calibrated_rating: number | null
          calibration_notes: string | null
          created_at: string
          cycle_id: string
          employee_id: string
          finalized_at: string | null
          id: string
          last_reminder_at: string | null
          manager_comments: string | null
          manager_rating: number | null
          manager_responses: Json
          reminder_count: number
          reviewer_id: string | null
          self_comments: string | null
          self_rating: number | null
          self_responses: Json
          status: Database["public"]["Enums"]["review_status"]
          template_id: string | null
          template_version: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledgment_comments?: string | null
          calibrated_at?: string | null
          calibrated_by?: string | null
          calibrated_rating?: number | null
          calibration_notes?: string | null
          created_at?: string
          cycle_id: string
          employee_id: string
          finalized_at?: string | null
          id?: string
          last_reminder_at?: string | null
          manager_comments?: string | null
          manager_rating?: number | null
          manager_responses?: Json
          reminder_count?: number
          reviewer_id?: string | null
          self_comments?: string | null
          self_rating?: number | null
          self_responses?: Json
          status?: Database["public"]["Enums"]["review_status"]
          template_id?: string | null
          template_version?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledgment_comments?: string | null
          calibrated_at?: string | null
          calibrated_by?: string | null
          calibrated_rating?: number | null
          calibration_notes?: string | null
          created_at?: string
          cycle_id?: string
          employee_id?: string
          finalized_at?: string | null
          id?: string
          last_reminder_at?: string | null
          manager_comments?: string | null
          manager_rating?: number | null
          manager_responses?: Json
          reminder_count?: number
          reviewer_id?: string | null
          self_comments?: string | null
          self_rating?: number | null
          self_responses?: Json
          status?: Database["public"]["Enums"]["review_status"]
          template_id?: string | null
          template_version?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      platform_acting_tenant: {
        Row: {
          set_at: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          set_at?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          set_at?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_acting_tenant_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acknowledgements: {
        Row: {
          acknowledged_at: string | null
          assigned_at: string
          created_at: string
          due_date: string | null
          employee_id: string
          id: string
          policy_id: string
          policy_version: number
          signature_name: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          assigned_at?: string
          created_at?: string
          due_date?: string | null
          employee_id: string
          id?: string
          policy_id: string
          policy_version: number
          signature_name?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          assigned_at?: string
          created_at?: string
          due_date?: string | null
          employee_id?: string
          id?: string
          policy_id?: string
          policy_version?: number
          signature_name?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acknowledgements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "policy_acknowledgements_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_documents: {
        Row: {
          body_md: string
          category: string
          created_at: string
          created_by: string | null
          effective_from: string | null
          id: string
          is_active: boolean
          requires_acknowledgement: boolean
          summary: string | null
          tenant_id: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          body_md?: string
          category?: string
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          id?: string
          is_active?: boolean
          requires_acknowledgement?: boolean
          summary?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          body_md?: string
          category?: string
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          id?: string
          is_active?: boolean
          requires_acknowledgement?: boolean
          summary?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mfa_enrolled_at: string | null
          mfa_method: string | null
          status: Database["public"]["Enums"]["account_status"]
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          mfa_enrolled_at?: string | null
          mfa_method?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mfa_enrolled_at?: string | null
          mfa_method?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          billing_type: string
          budget_amount: number | null
          budget_hours: number | null
          client_id: string
          code: string | null
          created_at: string
          currency_code: string | null
          description: string | null
          end_date: string | null
          hourly_rate: number | null
          id: string
          manager_id: string | null
          name: string
          start_date: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          billing_type?: string
          budget_amount?: number | null
          budget_hours?: number | null
          client_id: string
          code?: string | null
          created_at?: string
          currency_code?: string | null
          description?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          manager_id?: string | null
          name: string
          start_date?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          billing_type?: string
          budget_amount?: number | null
          budget_hours?: number | null
          client_id?: string
          code?: string | null
          created_at?: string
          currency_code?: string | null
          description?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          manager_id?: string | null
          name?: string
          start_date?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_notes: string | null
          effective_date: string
          employee_id: string
          from_department_id: string | null
          from_designation_id: string | null
          from_grade: string | null
          from_job_title: string | null
          from_manager_id: string | null
          id: string
          proposed_at: string
          proposed_by: string | null
          reason: string | null
          status: Database["public"]["Enums"]["promotion_status"]
          tenant_id: string
          to_department_id: string | null
          to_designation_id: string | null
          to_grade: string | null
          to_job_title: string
          to_manager_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          effective_date: string
          employee_id: string
          from_department_id?: string | null
          from_designation_id?: string | null
          from_grade?: string | null
          from_job_title?: string | null
          from_manager_id?: string | null
          id?: string
          proposed_at?: string
          proposed_by?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["promotion_status"]
          tenant_id: string
          to_department_id?: string | null
          to_designation_id?: string | null
          to_grade?: string | null
          to_job_title: string
          to_manager_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          effective_date?: string
          employee_id?: string
          from_department_id?: string | null
          from_designation_id?: string | null
          from_grade?: string | null
          from_job_title?: string | null
          from_manager_id?: string | null
          id?: string
          proposed_at?: string
          proposed_by?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["promotion_status"]
          tenant_id?: string
          to_department_id?: string | null
          to_designation_id?: string | null
          to_grade?: string | null
          to_job_title?: string
          to_manager_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "promotions_from_department_id_fkey"
            columns: ["from_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_from_designation_id_fkey"
            columns: ["from_designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_from_manager_id_fkey"
            columns: ["from_manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_from_manager_id_fkey"
            columns: ["from_manager_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_to_department_id_fkey"
            columns: ["to_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_to_designation_id_fkey"
            columns: ["to_designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_to_manager_id_fkey"
            columns: ["to_manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_to_manager_id_fkey"
            columns: ["to_manager_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      public_holiday_categories: {
        Row: {
          country_code: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          notes: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          notes?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          notes?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_holiday_categories_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "public_holiday_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      public_holidays: {
        Row: {
          country_code: string
          created_at: string
          holiday_date: string
          id: string
          is_paid: boolean
          is_recurring: boolean
          name: string
          notes: string | null
          pay_multiplier: number | null
          region: string | null
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          holiday_date: string
          id?: string
          is_paid?: boolean
          is_recurring?: boolean
          name: string
          notes?: string | null
          pay_multiplier?: number | null
          region?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          holiday_date?: string
          id?: string
          is_paid?: boolean
          is_recurring?: boolean
          name?: string
          notes?: string | null
          pay_multiplier?: number | null
          region?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_holidays_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      public_rate_limit_buckets: {
        Row: {
          bucket: string
          client_key: string
          id: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          bucket: string
          client_key: string
          id?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          bucket?: string
          client_key?: string
          id?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      rate_limit_buckets: {
        Row: {
          bucket: string
          id: string
          request_count: number
          updated_at: string
          user_id: string
          window_start: string
        }
        Insert: {
          bucket: string
          id?: string
          request_count?: number
          updated_at?: string
          user_id: string
          window_start?: string
        }
        Update: {
          bucket?: string
          id?: string
          request_count?: number
          updated_at?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      recruitment_candidates: {
        Row: {
          applied_at: string
          cover_letter: string | null
          created_at: string
          current_company: string | null
          current_title: string | null
          desired_salary: number | null
          email: string
          first_name: string
          hired_employee_id: string | null
          id: string
          job_id: string
          last_name: string
          linkedin_url: string | null
          overall_rating: number | null
          phone: string | null
          rejected_reason: string | null
          resume_path: string | null
          source: string | null
          stage_id: string | null
          status: Database["public"]["Enums"]["recruitment_candidate_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          created_at?: string
          current_company?: string | null
          current_title?: string | null
          desired_salary?: number | null
          email: string
          first_name: string
          hired_employee_id?: string | null
          id?: string
          job_id: string
          last_name: string
          linkedin_url?: string | null
          overall_rating?: number | null
          phone?: string | null
          rejected_reason?: string | null
          resume_path?: string | null
          source?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["recruitment_candidate_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          created_at?: string
          current_company?: string | null
          current_title?: string | null
          desired_salary?: number | null
          email?: string
          first_name?: string
          hired_employee_id?: string | null
          id?: string
          job_id?: string
          last_name?: string
          linkedin_url?: string | null
          overall_rating?: number | null
          phone?: string | null
          rejected_reason?: string | null
          resume_path?: string | null
          source?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["recruitment_candidate_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_candidates_hired_employee_id_fkey"
            columns: ["hired_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_candidates_hired_employee_id_fkey"
            columns: ["hired_employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "recruitment_candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "recruitment_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_candidates_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "recruitment_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_interviews: {
        Row: {
          branch_id: string | null
          candidate_id: string
          created_at: string
          created_by: string | null
          duration_minutes: number
          id: string
          interviewer_ids: string[]
          location: string | null
          mode: string
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["recruitment_interview_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          candidate_id: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number
          id?: string
          interviewer_ids?: string[]
          location?: string | null
          mode?: string
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["recruitment_interview_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          candidate_id?: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number
          id?: string
          interviewer_ids?: string[]
          location?: string | null
          mode?: string
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["recruitment_interview_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_interviews_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "recruitment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_interviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_jobs: {
        Row: {
          branch_id: string | null
          closed_at: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          department_id: string | null
          description_html: string | null
          employment_type: string | null
          hiring_manager_id: string | null
          id: string
          is_published: boolean
          location: string | null
          public_slug: string | null
          public_summary: string | null
          published_at: string | null
          requirements_html: string | null
          salary_max: number | null
          salary_min: number | null
          slug: string
          status: Database["public"]["Enums"]["recruitment_job_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          department_id?: string | null
          description_html?: string | null
          employment_type?: string | null
          hiring_manager_id?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          public_slug?: string | null
          public_summary?: string | null
          published_at?: string | null
          requirements_html?: string | null
          salary_max?: number | null
          salary_min?: number | null
          slug: string
          status?: Database["public"]["Enums"]["recruitment_job_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          department_id?: string | null
          description_html?: string | null
          employment_type?: string | null
          hiring_manager_id?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          public_slug?: string | null
          public_summary?: string | null
          published_at?: string | null
          requirements_html?: string | null
          salary_max?: number | null
          salary_min?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["recruitment_job_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_jobs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_jobs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_notes: {
        Row: {
          author_id: string
          body: string
          candidate_id: string
          created_at: string
          id: string
          tenant_id: string
        }
        Insert: {
          author_id: string
          body: string
          candidate_id: string
          created_at?: string
          id?: string
          tenant_id: string
        }
        Update: {
          author_id?: string
          body?: string
          candidate_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_notes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "recruitment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_offers: {
        Row: {
          base_salary: number
          candidate_id: string
          created_at: string
          created_by: string | null
          currency: string
          envelope_id: string | null
          id: string
          job_title: string
          notes: string | null
          responded_at: string | null
          sent_at: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["recruitment_offer_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          base_salary: number
          candidate_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          envelope_id?: string | null
          id?: string
          job_title: string
          notes?: string | null
          responded_at?: string | null
          sent_at?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["recruitment_offer_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          base_salary?: number
          candidate_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          envelope_id?: string | null
          id?: string
          job_title?: string
          notes?: string | null
          responded_at?: string | null
          sent_at?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["recruitment_offer_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_offers_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "recruitment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_offers_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "document_envelopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_offers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_scorecards: {
        Row: {
          candidate_id: string
          concerns: string | null
          created_at: string
          id: string
          interview_id: string | null
          overall_rating: number | null
          recommendation: string | null
          reviewer_id: string
          scores: Json
          strengths: string | null
          tenant_id: string
        }
        Insert: {
          candidate_id: string
          concerns?: string | null
          created_at?: string
          id?: string
          interview_id?: string | null
          overall_rating?: number | null
          recommendation?: string | null
          reviewer_id: string
          scores?: Json
          strengths?: string | null
          tenant_id: string
        }
        Update: {
          candidate_id?: string
          concerns?: string | null
          created_at?: string
          id?: string
          interview_id?: string | null
          overall_rating?: number | null
          recommendation?: string | null
          reviewer_id?: string
          scores?: Json
          strengths?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_scorecards_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "recruitment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_scorecards_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "recruitment_interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_scorecards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_stages: {
        Row: {
          created_at: string
          id: string
          is_terminal: boolean
          job_id: string | null
          kind: string
          name: string
          sort_order: number
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_terminal?: boolean
          job_id?: string | null
          kind?: string
          name: string
          sort_order?: number
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_terminal?: boolean
          job_id?: string | null
          kind?: string
          name?: string
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_stages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "recruitment_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_stages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          code: string
          created_at: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          name?: string
        }
        Relationships: []
      }
      review_cycles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          period_end: string
          period_start: string
          reminder_business_days_only: boolean
          reminder_interval_days: number
          reminder_max_count: number | null
          reminder_start_offset_days: number
          reminders_enabled: boolean
          status: Database["public"]["Enums"]["review_cycle_status"]
          template_id: string | null
          template_version: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          period_end: string
          period_start: string
          reminder_business_days_only?: boolean
          reminder_interval_days?: number
          reminder_max_count?: number | null
          reminder_start_offset_days?: number
          reminders_enabled?: boolean
          status?: Database["public"]["Enums"]["review_cycle_status"]
          template_id?: string | null
          template_version?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          period_end?: string
          period_start?: string
          reminder_business_days_only?: boolean
          reminder_interval_days?: number
          reminder_max_count?: number | null
          reminder_start_offset_days?: number
          reminders_enabled?: boolean
          status?: Database["public"]["Enums"]["review_cycle_status"]
          template_id?: string | null
          template_version?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_feedback: {
        Row: {
          author_id: string
          avg_rating: number | null
          created_at: string
          id: string
          kind: string
          responses: Json
          review_id: string
          template_id: string | null
          template_version: number | null
          tenant_id: string
          text: string
        }
        Insert: {
          author_id: string
          avg_rating?: number | null
          created_at?: string
          id?: string
          kind?: string
          responses?: Json
          review_id: string
          template_id?: string | null
          template_version?: number | null
          tenant_id: string
          text: string
        }
        Update: {
          author_id?: string
          avg_rating?: number | null
          created_at?: string
          id?: string
          kind?: string
          responses?: Json
          review_id?: string
          template_id?: string | null
          template_version?: number | null
          tenant_id?: string
          text?: string
        }
        Relationships: []
      }
      review_feedback_requests: {
        Row: {
          created_at: string
          due_date: string | null
          feedback_id: string | null
          id: string
          kind: string
          last_reminder_at: string | null
          message: string | null
          reminder_count: number
          requested_user_id: string
          requester_id: string
          responded_at: string | null
          review_id: string
          status: string
          subject_employee_id: string
          template_id: string | null
          template_version: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          feedback_id?: string | null
          id?: string
          kind?: string
          last_reminder_at?: string | null
          message?: string | null
          reminder_count?: number
          requested_user_id: string
          requester_id: string
          responded_at?: string | null
          review_id: string
          status?: string
          subject_employee_id: string
          template_id?: string | null
          template_version?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          feedback_id?: string | null
          id?: string
          kind?: string
          last_reminder_at?: string | null
          message?: string | null
          reminder_count?: number
          requested_user_id?: string
          requester_id?: string
          responded_at?: string | null
          review_id?: string
          status?: string
          subject_employee_id?: string
          template_id?: string | null
          template_version?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_instance_versions: {
        Row: {
          actor_id: string | null
          created_at: string
          employee_comments: string | null
          evidence: Json | null
          id: string
          instance_id: string
          reviewed_at: string | null
          reviewer_comments: string | null
          score: Json | null
          snapshot_reason: string | null
          status: string
          submitted_at: string | null
          tenant_id: string
          version: number
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          employee_comments?: string | null
          evidence?: Json | null
          id?: string
          instance_id: string
          reviewed_at?: string | null
          reviewer_comments?: string | null
          score?: Json | null
          snapshot_reason?: string | null
          status: string
          submitted_at?: string | null
          tenant_id: string
          version: number
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          employee_comments?: string | null
          evidence?: Json | null
          id?: string
          instance_id?: string
          reviewed_at?: string | null
          reviewer_comments?: string | null
          score?: Json | null
          snapshot_reason?: string | null
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "review_instance_versions_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "review_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      review_instances: {
        Row: {
          created_at: string
          due_date: string | null
          employee_id: string
          evidence: Json | null
          id: string
          item_id: string
          period_label: string
          rejected_at: string | null
          reminder_count: number
          reminder_sent_at: string | null
          resubmitted_at: string | null
          reviewed_at: string | null
          reviewer_comments: string | null
          reviewer_id: string | null
          scheduled_for: string
          score: Json | null
          status: string
          submitted_at: string | null
          template_id: string
          template_version: number | null
          tenant_id: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          employee_id: string
          evidence?: Json | null
          id?: string
          item_id: string
          period_label: string
          rejected_at?: string | null
          reminder_count?: number
          reminder_sent_at?: string | null
          resubmitted_at?: string | null
          reviewed_at?: string | null
          reviewer_comments?: string | null
          reviewer_id?: string | null
          scheduled_for: string
          score?: Json | null
          status?: string
          submitted_at?: string | null
          template_id: string
          template_version?: number | null
          tenant_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          due_date?: string | null
          employee_id?: string
          evidence?: Json | null
          id?: string
          item_id?: string
          period_label?: string
          rejected_at?: string | null
          reminder_count?: number
          reminder_sent_at?: string | null
          resubmitted_at?: string | null
          reviewed_at?: string | null
          reviewer_comments?: string | null
          reviewer_id?: string | null
          scheduled_for?: string
          score?: Json | null
          status?: string
          submitted_at?: string | null
          template_id?: string
          template_version?: number | null
          tenant_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      review_template_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string
          created_at: string
          file_name: string | null
          id: string
          snapshot: Json | null
          template_id: string | null
          template_name: string
          tenant_id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id: string
          created_at?: string
          file_name?: string | null
          id?: string
          snapshot?: Json | null
          template_id?: string | null
          template_name: string
          tenant_id: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string
          created_at?: string
          file_name?: string | null
          id?: string
          snapshot?: Json | null
          template_id?: string | null
          template_name?: string
          tenant_id?: string
        }
        Relationships: []
      }
      review_templates: {
        Row: {
          change_note: string | null
          competencies: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          is_current: boolean
          is_default: boolean
          kind: string
          name: string
          parent_template_id: string | null
          scale_labels: Json
          scale_max: number
          scale_min: number
          tenant_id: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          change_note?: string | null
          competencies?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_current?: boolean
          is_default?: boolean
          kind?: string
          name: string
          parent_template_id?: string | null
          scale_labels?: Json
          scale_max?: number
          scale_min?: number
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          change_note?: string | null
          competencies?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_current?: boolean
          is_default?: boolean
          kind?: string
          name?: string
          parent_template_id?: string | null
          scale_labels?: Json
          scale_max?: number
          scale_min?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      role_scope: {
        Row: {
          branch_id: string | null
          country_code: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          branch_id?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_scope_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_scope_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "role_scope_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      security_findings_log: {
        Row: {
          created_at: string
          description: string | null
          fixed_in_commit: string | null
          id: string
          internal_id: string
          recorded_by: string | null
          remediation: string | null
          resolved_at: string | null
          resolved_by: string | null
          scanned_at: string
          scanner_name: string
          severity: string
          status: string
          ticket_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fixed_in_commit?: string | null
          id?: string
          internal_id: string
          recorded_by?: string | null
          remediation?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scanned_at?: string
          scanner_name: string
          severity: string
          status?: string
          ticket_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fixed_in_commit?: string | null
          id?: string
          internal_id?: string
          recorded_by?: string | null
          remediation?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scanned_at?: string
          scanner_name?: string
          severity?: string
          status?: string
          ticket_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_scan_alerts: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          finding_id: string | null
          id: string
          internal_id: string
          recipient: string
          scanner_name: string
          sent_at: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          finding_id?: string | null
          id?: string
          internal_id: string
          recipient: string
          scanner_name: string
          sent_at?: string | null
          severity: string
          status?: string
          title: string
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          finding_id?: string | null
          id?: string
          internal_id?: string
          recipient?: string
          scanner_name?: string
          sent_at?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_scan_alerts_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "security_findings_log"
            referencedColumns: ["id"]
          },
        ]
      }
      sign_geofences: {
        Row: {
          background_tracking_enabled: boolean
          created_at: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          min_accuracy_meters: number
          name: string
          notes: string | null
          radius_meters: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          background_tracking_enabled?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          min_accuracy_meters?: number
          name: string
          notes?: string | null
          radius_meters?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          background_tracking_enabled?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          min_accuracy_meters?: number
          name?: string
          notes?: string | null
          radius_meters?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sign_geofences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invitations: {
        Row: {
          accepted_at: string | null
          accepted_user_id: string | null
          country_code: string | null
          created_at: string
          department_id: string | null
          duties: Json
          email: string
          expires_at: string
          first_name: string | null
          id: string
          invited_by: string | null
          job_title: string | null
          last_name: string | null
          last_sent_at: string
          role: Database["public"]["Enums"]["app_role"]
          send_count: number
          state_region: string | null
          status: string
          tenant_id: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          country_code?: string | null
          created_at?: string
          department_id?: string | null
          duties?: Json
          email: string
          expires_at?: string
          first_name?: string | null
          id?: string
          invited_by?: string | null
          job_title?: string | null
          last_name?: string | null
          last_sent_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          send_count?: number
          state_region?: string | null
          status?: string
          tenant_id: string
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          country_code?: string | null
          created_at?: string
          department_id?: string | null
          duties?: Json
          email?: string
          expires_at?: string
          first_name?: string | null
          id?: string
          invited_by?: string | null
          job_title?: string | null
          last_name?: string | null
          last_sent_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          send_count?: number
          state_region?: string | null
          status?: string
          tenant_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_onboarding_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_branch_code: string | null
          bank_iban: string | null
          bank_name: string | null
          bank_swift: string | null
          city: string | null
          country_code: string | null
          country_of_residence: string | null
          country_specific: Json
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          employee_id: string
          gender: string | null
          legal_first_name: string | null
          legal_last_name: string | null
          legal_middle_name: string | null
          marital_status: string | null
          national_id_number: string | null
          nationality: string | null
          notes: string | null
          pension_fund_number: string | null
          personal_email: string | null
          personal_phone: string | null
          postal_code: string | null
          provident_fund_number: string | null
          region: string | null
          social_security_number: string | null
          submitted_at: string | null
          submitted_by: string | null
          tax_identification_number: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_branch_code?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bank_swift?: string | null
          city?: string | null
          country_code?: string | null
          country_of_residence?: string | null
          country_specific?: Json
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_id: string
          gender?: string | null
          legal_first_name?: string | null
          legal_last_name?: string | null
          legal_middle_name?: string | null
          marital_status?: string | null
          national_id_number?: string | null
          nationality?: string | null
          notes?: string | null
          pension_fund_number?: string | null
          personal_email?: string | null
          personal_phone?: string | null
          postal_code?: string | null
          provident_fund_number?: string | null
          region?: string | null
          social_security_number?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          tax_identification_number?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_branch_code?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bank_swift?: string | null
          city?: string | null
          country_code?: string | null
          country_of_residence?: string | null
          country_specific?: Json
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_id?: string
          gender?: string | null
          legal_first_name?: string | null
          legal_last_name?: string | null
          legal_middle_name?: string | null
          marital_status?: string | null
          national_id_number?: string | null
          nationality?: string | null
          notes?: string | null
          pension_fund_number?: string | null
          personal_email?: string | null
          personal_phone?: string | null
          postal_code?: string | null
          provident_fund_number?: string | null
          region?: string | null
          social_security_number?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          tax_identification_number?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stp_finalisation_events: {
        Row: {
          acknowledged_at: string | null
          ato_response: Json | null
          created_at: string
          created_by: string | null
          employee_id: string
          error_message: string | null
          financial_year: number
          gateway: string
          gateway_message_id: string | null
          id: string
          payload: Json
          payload_hash: string
          run_type: string
          status: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          ato_response?: Json | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          error_message?: string | null
          financial_year: number
          gateway?: string
          gateway_message_id?: string | null
          id?: string
          payload: Json
          payload_hash: string
          run_type?: string
          status?: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          ato_response?: Json | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          error_message?: string | null
          financial_year?: number
          gateway?: string
          gateway_message_id?: string | null
          id?: string
          payload?: Json
          payload_hash?: string
          run_type?: string
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stp_finalisation_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stp_finalisation_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "stp_finalisation_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stp_pay_events: {
        Row: {
          acknowledged_at: string | null
          ato_response: Json | null
          created_at: string
          created_by: string | null
          error_message: string | null
          gateway: string
          gateway_message_id: string | null
          id: string
          payload: Json
          payload_hash: string | null
          payment_date: string
          period_end: string
          period_start: string
          run_id: string
          run_type: string
          status: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          ato_response?: Json | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          gateway?: string
          gateway_message_id?: string | null
          id?: string
          payload?: Json
          payload_hash?: string | null
          payment_date: string
          period_end: string
          period_start: string
          run_id: string
          run_type?: string
          status?: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          ato_response?: Json | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          gateway?: string
          gateway_message_id?: string | null
          id?: string
          payload?: Json
          payload_hash?: string | null
          payment_date?: string
          period_end?: string
          period_start?: string
          run_id?: string
          run_type?: string
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stp_pay_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stp_pay_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_confirmations: {
        Row: {
          amount: number
          bank_reference: string
          confirmed_by: string
          created_at: string
          currency_code: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          tenant_id: string
        }
        Insert: {
          amount: number
          bank_reference: string
          confirmed_by: string
          created_at?: string
          currency_code: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          tenant_id: string
        }
        Update: {
          amount?: number
          bank_reference?: string
          confirmed_by?: string
          created_at?: string
          currency_code?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_confirmations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_basis: string
          code: string
          created_at: string
          currency_code: string
          description: string | null
          employee_limit: number | null
          features: Json
          id: string
          is_active: boolean
          is_addon: boolean
          name: string
          price_annual: number
          price_monthly: number
          sort_order: number
          stripe_price_id: string | null
          trial_months: number
          updated_at: string
        }
        Insert: {
          billing_basis?: string
          code: string
          created_at?: string
          currency_code?: string
          description?: string | null
          employee_limit?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          is_addon?: boolean
          name: string
          price_annual?: number
          price_monthly?: number
          sort_order?: number
          stripe_price_id?: string | null
          trial_months?: number
          updated_at?: string
        }
        Update: {
          billing_basis?: string
          code?: string
          created_at?: string
          currency_code?: string
          description?: string | null
          employee_limit?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          is_addon?: boolean
          name?: string
          price_annual?: number
          price_monthly?: number
          sort_order?: number
          stripe_price_id?: string | null
          trial_months?: number
          updated_at?: string
        }
        Relationships: []
      }
      super_batches: {
        Row: {
          contribution_count: number
          created_at: string
          created_by: string | null
          error_message: string | null
          gateway: string
          gateway_config: Json
          gateway_message_id: string | null
          id: string
          paid_at: string | null
          payload: Json | null
          payment_due_date: string
          period_end: string
          period_start: string
          response: Json | null
          status: string
          submitted_at: string | null
          tenant_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          contribution_count?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          gateway?: string
          gateway_config?: Json
          gateway_message_id?: string | null
          id?: string
          paid_at?: string | null
          payload?: Json | null
          payment_due_date: string
          period_end: string
          period_start: string
          response?: Json | null
          status?: string
          submitted_at?: string | null
          tenant_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          contribution_count?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          gateway?: string
          gateway_config?: Json
          gateway_message_id?: string | null
          id?: string
          paid_at?: string | null
          payload?: Json | null
          payment_due_date?: string
          period_end?: string
          period_start?: string
          response?: Json | null
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "super_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      super_contributions: {
        Row: {
          amount: number
          batch_id: string | null
          contribution_type: string
          created_at: string
          employee_id: string
          id: string
          member_number: string | null
          metadata: Json
          ote_base: number | null
          pay_date: string
          payment_due_date: string | null
          payslip_id: string | null
          run_id: string | null
          status: string
          super_fund_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          batch_id?: string | null
          contribution_type: string
          created_at?: string
          employee_id: string
          id?: string
          member_number?: string | null
          metadata?: Json
          ote_base?: number | null
          pay_date: string
          payment_due_date?: string | null
          payslip_id?: string | null
          run_id?: string | null
          status?: string
          super_fund_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          batch_id?: string | null
          contribution_type?: string
          created_at?: string
          employee_id?: string
          id?: string
          member_number?: string | null
          metadata?: Json
          ote_base?: number | null
          pay_date?: string
          payment_due_date?: string | null
          payslip_id?: string | null
          run_id?: string | null
          status?: string
          super_fund_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "super_contributions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "super_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_contributions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_contributions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "super_contributions_payslip_id_fkey"
            columns: ["payslip_id"]
            isOneToOne: false
            referencedRelation: "payroll_payslips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_contributions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_contributions_super_fund_id_fkey"
            columns: ["super_fund_id"]
            isOneToOne: false
            referencedRelation: "super_funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_contributions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      super_funds: {
        Row: {
          abn: string | null
          created_at: string
          fund_type: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          smsf_account_name: string | null
          smsf_account_number: string | null
          smsf_bsb: string | null
          smsf_esa: string | null
          tenant_id: string
          updated_at: string
          usi: string | null
        }
        Insert: {
          abn?: string | null
          created_at?: string
          fund_type?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          smsf_account_name?: string | null
          smsf_account_number?: string | null
          smsf_bsb?: string | null
          smsf_esa?: string | null
          tenant_id: string
          updated_at?: string
          usi?: string | null
        }
        Update: {
          abn?: string | null
          created_at?: string
          fund_type?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          smsf_account_name?: string | null
          smsf_account_number?: string | null
          smsf_bsb?: string | null
          smsf_esa?: string | null
          tenant_id?: string
          updated_at?: string
          usi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "super_funds_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_internal: boolean
          tenant_id: string
          ticket_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          tenant_id: string
          ticket_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          tenant_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_comments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          approver_id: string | null
          assigned_to: string | null
          attachments: Json
          category: Database["public"]["Enums"]["support_ticket_category"]
          created_at: string
          created_by: string
          currency_code: string | null
          decided_at: string | null
          decision_notes: string | null
          description: string
          employee_id: string
          id: string
          metadata: Json
          priority: Database["public"]["Enums"]["support_ticket_priority"]
          requested_amount: number | null
          requested_for_date: string | null
          status: Database["public"]["Enums"]["support_ticket_status"]
          subject: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approver_id?: string | null
          assigned_to?: string | null
          attachments?: Json
          category: Database["public"]["Enums"]["support_ticket_category"]
          created_at?: string
          created_by: string
          currency_code?: string | null
          decided_at?: string | null
          decision_notes?: string | null
          description: string
          employee_id: string
          id?: string
          metadata?: Json
          priority?: Database["public"]["Enums"]["support_ticket_priority"]
          requested_amount?: number | null
          requested_for_date?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"]
          subject: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approver_id?: string | null
          assigned_to?: string | null
          attachments?: Json
          category?: Database["public"]["Enums"]["support_ticket_category"]
          created_at?: string
          created_by?: string
          currency_code?: string | null
          decided_at?: string | null
          decision_notes?: string | null
          description?: string
          employee_id?: string
          id?: string
          metadata?: Json
          priority?: Database["public"]["Enums"]["support_ticket_priority"]
          requested_amount?: number | null
          requested_for_date?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"]
          subject?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "support_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tax_brackets: {
        Row: {
          bracket_order: number
          country_code: string
          created_at: string
          effective_from: string
          effective_to: string | null
          fixed_amount: number
          id: string
          is_active: boolean
          max_income: number | null
          min_income: number
          name: string
          rate_percent: number
          updated_at: string
        }
        Insert: {
          bracket_order: number
          country_code: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          fixed_amount?: number
          id?: string
          is_active?: boolean
          max_income?: number | null
          min_income?: number
          name: string
          rate_percent: number
          updated_at?: string
        }
        Update: {
          bracket_order?: number
          country_code?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          fixed_amount?: number
          id?: string
          is_active?: boolean
          max_income?: number | null
          min_income?: number
          name?: string
          rate_percent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_brackets_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      tax_tables_au: {
        Row: {
          a: number
          b: number
          created_at: string
          effective_from: string
          effective_to: string | null
          frequency: string
          id: string
          notes: string | null
          scale: string
          threshold_max: number | null
          threshold_min: number
        }
        Insert: {
          a: number
          b: number
          created_at?: string
          effective_from: string
          effective_to?: string | null
          frequency: string
          id?: string
          notes?: string | null
          scale: string
          threshold_max?: number | null
          threshold_min: number
        }
        Update: {
          a?: number
          b?: number
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          frequency?: string
          id?: string
          notes?: string | null
          scale?: string
          threshold_max?: number | null
          threshold_min?: number
        }
        Relationships: []
      }
      tenant_billing_snapshots: {
        Row: {
          addon_amount_cents: number
          addon_units: number
          base_amount_cents: number
          base_units: number
          created_at: string
          currency: string
          error: string | null
          id: string
          joined_count: number
          left_count: number
          net_employees: number
          period_end: string
          period_month: number
          period_start: string
          period_year: number
          plan_change_prorated: Json | null
          reconciled_at: string | null
          reconciliation_delta: number | null
          reported_at: string | null
          status: string
          stripe_addon_usage_id: string | null
          stripe_base_usage_id: string | null
          tenant_id: string
          trial_applied: boolean
          updated_at: string
        }
        Insert: {
          addon_amount_cents?: number
          addon_units?: number
          base_amount_cents?: number
          base_units?: number
          created_at?: string
          currency?: string
          error?: string | null
          id?: string
          joined_count?: number
          left_count?: number
          net_employees?: number
          period_end: string
          period_month: number
          period_start: string
          period_year: number
          plan_change_prorated?: Json | null
          reconciled_at?: string | null
          reconciliation_delta?: number | null
          reported_at?: string | null
          status?: string
          stripe_addon_usage_id?: string | null
          stripe_base_usage_id?: string | null
          tenant_id: string
          trial_applied?: boolean
          updated_at?: string
        }
        Update: {
          addon_amount_cents?: number
          addon_units?: number
          base_amount_cents?: number
          base_units?: number
          created_at?: string
          currency?: string
          error?: string | null
          id?: string
          joined_count?: number
          left_count?: number
          net_employees?: number
          period_end?: string
          period_month?: number
          period_start?: string
          period_year?: number
          plan_change_prorated?: Json | null
          reconciled_at?: string | null
          reconciliation_delta?: number | null
          reported_at?: string | null
          status?: string
          stripe_addon_usage_id?: string | null
          stripe_base_usage_id?: string | null
          tenant_id?: string
          trial_applied?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_billing_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_branches: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          code: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country_code: string
          created_at: string
          created_by: string | null
          currency_code: string
          holiday_category_id: string | null
          id: string
          is_headquarters: boolean
          name: string
          postal_code: string | null
          region: string | null
          status: string
          tenant_id: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          code: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country_code: string
          created_at?: string
          created_by?: string | null
          currency_code: string
          holiday_category_id?: string | null
          id?: string
          is_headquarters?: boolean
          name: string
          postal_code?: string | null
          region?: string | null
          status?: string
          tenant_id: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          code?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country_code?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          holiday_category_id?: string | null
          id?: string
          is_headquarters?: boolean
          name?: string
          postal_code?: string | null
          region?: string | null
          status?: string
          tenant_id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_branches_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "tenant_branches_holiday_category_id_fkey"
            columns: ["holiday_category_id"]
            isOneToOne: false
            referencedRelation: "public_holiday_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_careers_settings: {
        Row: {
          about_html: string | null
          brand_color: string | null
          created_at: string
          headline: string | null
          hero_image_url: string | null
          is_enabled: boolean
          public_slug: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          about_html?: string | null
          brand_color?: string | null
          created_at?: string
          headline?: string | null
          hero_image_url?: string | null
          is_enabled?: boolean
          public_slug: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          about_html?: string | null
          brand_color?: string | null
          created_at?: string
          headline?: string | null
          hero_image_url?: string | null
          is_enabled?: boolean
          public_slug?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_governance: {
        Row: {
          created_at: string
          health_status: string
          internal_notes: string | null
          last_reviewed_at: string | null
          last_reviewed_by: string | null
          risk_score: number
          security_alert_webhook_url: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          health_status?: string
          internal_notes?: string | null
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
          risk_score?: number
          security_alert_webhook_url?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          health_status?: string
          internal_notes?: string | null
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
          risk_score?: number
          security_alert_webhook_url?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_governance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_invoices: {
        Row: {
          amount_due: number
          amount_paid: number
          attempt_count: number
          created_at: string
          currency: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_created_at: string | null
          invoice_pdf: string | null
          last_payment_error: string | null
          paid_at: string | null
          period_end: string | null
          period_start: string | null
          status: string
          stripe_customer_id: string | null
          stripe_invoice_id: string
          stripe_subscription_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount_due?: number
          amount_paid?: number
          attempt_count?: number
          created_at?: string
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_created_at?: string | null
          invoice_pdf?: string | null
          last_payment_error?: string | null
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_invoice_id: string
          stripe_subscription_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          attempt_count?: number
          created_at?: string
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_created_at?: string | null
          invoice_pdf?: string | null
          last_payment_error?: string | null
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string
          stripe_subscription_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_mfa_policy: {
        Row: {
          created_at: string
          grace_period_days: number
          is_enforced: boolean
          required_roles: string[]
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          grace_period_days?: number
          is_enforced?: boolean
          required_roles?: string[]
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          grace_period_days?: number
          is_enforced?: boolean
          required_roles?: string[]
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tenant_payroll_settings: {
        Row: {
          abn: string | null
          bms_id: string | null
          branch_code: string | null
          created_at: string
          default_super_fund_id: string | null
          meal_break_minutes: number
          notes: string | null
          pay_period: string
          payday_super_enabled: boolean
          rest_break_minutes: number
          standard_days_per_week: number
          standard_hours_per_day: number
          stp_gateway: string
          stp_gateway_config: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          abn?: string | null
          bms_id?: string | null
          branch_code?: string | null
          created_at?: string
          default_super_fund_id?: string | null
          meal_break_minutes?: number
          notes?: string | null
          pay_period?: string
          payday_super_enabled?: boolean
          rest_break_minutes?: number
          standard_days_per_week?: number
          standard_hours_per_day?: number
          stp_gateway?: string
          stp_gateway_config?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          abn?: string | null
          bms_id?: string | null
          branch_code?: string | null
          created_at?: string
          default_super_fund_id?: string | null
          meal_break_minutes?: number
          notes?: string | null
          pay_period?: string
          payday_super_enabled?: boolean
          rest_break_minutes?: number
          standard_days_per_week?: number
          standard_hours_per_day?: number
          stp_gateway?: string
          stp_gateway_config?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_payroll_settings_default_super_fund_id_fkey"
            columns: ["default_super_fund_id"]
            isOneToOne: false
            referencedRelation: "super_funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_payroll_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_setup_state: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          last_segment: string | null
          skipped_segments: string[]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          last_segment?: string | null
          skipped_segments?: string[]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          last_segment?: string | null
          skipped_segments?: string[]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_setup_state_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_subscriptions: {
        Row: {
          addon_subscription_item_id: string | null
          allow_card_fallback: boolean
          au_payroll_addon: boolean
          base_subscription_item_id: string | null
          billing_interval: Database["public"]["Enums"]["billing_interval"]
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          debit_regions: string[]
          id: string
          last_reported_period: string | null
          mandate_last_checked_at: string | null
          mandate_payment_method_id: string | null
          mandate_status: string | null
          notes: string | null
          pending_plan_id: string | null
          plan_change_effective: string | null
          plan_changed_at: string | null
          plan_id: string
          prior_plan_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          trial_consumed: boolean
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          addon_subscription_item_id?: string | null
          allow_card_fallback?: boolean
          au_payroll_addon?: boolean
          base_subscription_item_id?: string | null
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          debit_regions?: string[]
          id?: string
          last_reported_period?: string | null
          mandate_last_checked_at?: string | null
          mandate_payment_method_id?: string | null
          mandate_status?: string | null
          notes?: string | null
          pending_plan_id?: string | null
          plan_change_effective?: string | null
          plan_changed_at?: string | null
          plan_id: string
          prior_plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
          trial_consumed?: boolean
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          addon_subscription_item_id?: string | null
          allow_card_fallback?: boolean
          au_payroll_addon?: boolean
          base_subscription_item_id?: string | null
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          debit_regions?: string[]
          id?: string
          last_reported_period?: string | null
          mandate_last_checked_at?: string | null
          mandate_payment_method_id?: string | null
          mandate_status?: string | null
          notes?: string | null
          pending_plan_id?: string | null
          plan_change_effective?: string | null
          plan_changed_at?: string | null
          plan_id?: string
          prior_plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          trial_consumed?: boolean
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_pending_plan_id_fkey"
            columns: ["pending_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_subscriptions_prior_plan_id_fkey"
            columns: ["prior_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          approved_at: string | null
          approved_by: string | null
          city: string | null
          contact_email: string
          contact_phone: string | null
          country_code: string
          created_at: string
          created_by: string | null
          csv_export_retention_days: number
          currency_code: string
          default_holiday_category_id: string | null
          id: string
          kpi_strict_weights: boolean
          kpi_weight_tolerance: number
          legal_name: string | null
          name: string
          plan: string
          postal_code: string | null
          primary_contact_name: string | null
          region: string | null
          registration_number: string | null
          reminder_local_hour: number
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          tagline: string | null
          tax_id_number: string | null
          timezone: string
          trading_name: string | null
          updated_at: string
          website: string | null
          wfh_enabled: boolean
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          contact_email: string
          contact_phone?: string | null
          country_code: string
          created_at?: string
          created_by?: string | null
          csv_export_retention_days?: number
          currency_code?: string
          default_holiday_category_id?: string | null
          id?: string
          kpi_strict_weights?: boolean
          kpi_weight_tolerance?: number
          legal_name?: string | null
          name: string
          plan?: string
          postal_code?: string | null
          primary_contact_name?: string | null
          region?: string | null
          registration_number?: string | null
          reminder_local_hour?: number
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          tagline?: string | null
          tax_id_number?: string | null
          timezone?: string
          trading_name?: string | null
          updated_at?: string
          website?: string | null
          wfh_enabled?: boolean
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          contact_email?: string
          contact_phone?: string | null
          country_code?: string
          created_at?: string
          created_by?: string | null
          csv_export_retention_days?: number
          currency_code?: string
          default_holiday_category_id?: string | null
          id?: string
          kpi_strict_weights?: boolean
          kpi_weight_tolerance?: number
          legal_name?: string | null
          name?: string
          plan?: string
          postal_code?: string | null
          primary_contact_name?: string | null
          region?: string | null
          registration_number?: string | null
          reminder_local_hour?: number
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          tagline?: string | null
          tax_id_number?: string | null
          timezone?: string
          trading_name?: string | null
          updated_at?: string
          website?: string | null
          wfh_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "tenants_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "tenants_default_holiday_category_id_fkey"
            columns: ["default_holiday_category_id"]
            isOneToOne: false
            referencedRelation: "public_holiday_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          billable: boolean
          branch_id: string | null
          created_at: string
          currency_code: string | null
          description: string | null
          employee_id: string
          hourly_rate: number | null
          hours: number
          id: string
          invoice_line_id: string | null
          job_id: string | null
          location_label: string | null
          project_id: string
          rostered_hours: number | null
          status: string
          tenant_id: string
          updated_at: string
          work_date: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          billable?: boolean
          branch_id?: string | null
          created_at?: string
          currency_code?: string | null
          description?: string | null
          employee_id: string
          hourly_rate?: number | null
          hours: number
          id?: string
          invoice_line_id?: string | null
          job_id?: string | null
          location_label?: string | null
          project_id: string
          rostered_hours?: number | null
          status?: string
          tenant_id: string
          updated_at?: string
          work_date: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          billable?: boolean
          branch_id?: string | null
          created_at?: string
          currency_code?: string | null
          description?: string | null
          employee_id?: string
          hourly_rate?: number | null
          hours?: number
          id?: string
          invoice_line_id?: string | null
          job_id?: string | null
          location_label?: string | null
          project_id?: string
          rostered_hours?: number | null
          status?: string
          tenant_id?: string
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tenant_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "client_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entry_allocations: {
        Row: {
          cost_centre_code: string | null
          created_at: string
          department_id: string | null
          hours: number
          id: string
          job_id: string | null
          notes: string | null
          percentage: number
          project_id: string | null
          tenant_id: string
          time_entry_id: string
          updated_at: string
        }
        Insert: {
          cost_centre_code?: string | null
          created_at?: string
          department_id?: string | null
          hours: number
          id?: string
          job_id?: string | null
          notes?: string | null
          percentage: number
          project_id?: string | null
          tenant_id: string
          time_entry_id: string
          updated_at?: string
        }
        Update: {
          cost_centre_code?: string | null
          created_at?: string
          department_id?: string | null
          hours?: number
          id?: string
          job_id?: string | null
          notes?: string | null
          percentage?: number
          project_id?: string | null
          tenant_id?: string
          time_entry_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entry_allocations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entry_allocations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "client_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entry_allocations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entry_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entry_allocations_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          consumed_by_run_id: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          overtime_breakdown: Json
          overtime_hours: number
          period_end: string
          period_start: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["timesheet_status"]
          submitted_at: string | null
          submitted_by: string | null
          tenant_id: string
          total_hours: number
          totals: Json
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          consumed_by_run_id?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          overtime_breakdown?: Json
          overtime_hours?: number
          period_end: string
          period_start: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["timesheet_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          tenant_id: string
          total_hours?: number
          totals?: Json
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          consumed_by_run_id?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          overtime_breakdown?: Json
          overtime_hours?: number
          period_end?: string
          period_start?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["timesheet_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          tenant_id?: string
          total_hours?: number
          totals?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_consumed_by_run_id_fkey"
            columns: ["consumed_by_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      toil_accruals: {
        Row: {
          accrued_on: string
          consumed_hours: number
          created_at: string
          created_by: string | null
          employee_id: string
          expires_on: string | null
          hours: number
          id: string
          notes: string | null
          source: Database["public"]["Enums"]["toil_source"]
          source_ref: string | null
          status: Database["public"]["Enums"]["toil_accrual_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accrued_on?: string
          consumed_hours?: number
          created_at?: string
          created_by?: string | null
          employee_id: string
          expires_on?: string | null
          hours: number
          id?: string
          notes?: string | null
          source: Database["public"]["Enums"]["toil_source"]
          source_ref?: string | null
          status?: Database["public"]["Enums"]["toil_accrual_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accrued_on?: string
          consumed_hours?: number
          created_at?: string
          created_by?: string | null
          employee_id?: string
          expires_on?: string | null
          hours?: number
          id?: string
          notes?: string | null
          source?: Database["public"]["Enums"]["toil_source"]
          source_ref?: string | null
          status?: Database["public"]["Enums"]["toil_accrual_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toil_accruals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toil_accruals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "toil_accruals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      toil_requests: {
        Row: {
          approver_id: string | null
          created_at: string
          decided_at: string | null
          decision_notes: string | null
          employee_id: string
          end_date: string
          hours: number
          id: string
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["toil_request_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approver_id?: string | null
          created_at?: string
          decided_at?: string | null
          decision_notes?: string | null
          employee_id: string
          end_date: string
          hours: number
          id?: string
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["toil_request_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approver_id?: string | null
          created_at?: string
          decided_at?: string | null
          decision_notes?: string | null
          employee_id?: string
          end_date?: string
          hours?: number
          id?: string
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["toil_request_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toil_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toil_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "toil_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      toil_settings: {
        Row: {
          allow_overtime_to_toil: boolean
          allow_toil_to_overtime: boolean
          created_at: string
          enabled: boolean
          expiry_months: number
          max_balance_hours: number | null
          min_request_hours: number
          overtime_multiplier: number
          penalty_multiplier: number
          require_approval: boolean
          shift_swap_multiplier: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allow_overtime_to_toil?: boolean
          allow_toil_to_overtime?: boolean
          created_at?: string
          enabled?: boolean
          expiry_months?: number
          max_balance_hours?: number | null
          min_request_hours?: number
          overtime_multiplier?: number
          penalty_multiplier?: number
          require_approval?: boolean
          shift_swap_multiplier?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allow_overtime_to_toil?: boolean
          allow_toil_to_overtime?: boolean
          created_at?: string
          enabled?: boolean
          expiry_months?: number
          max_balance_hours?: number | null
          min_request_hours?: number
          overtime_multiplier?: number
          penalty_multiplier?: number
          require_approval?: boolean
          shift_swap_multiplier?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toil_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      training_bundle_items: {
        Row: {
          bundle_id: string
          course_id: string
          created_at: string
          due_offset_days: number
          id: string
          required: boolean
          sort_order: number
          tenant_id: string
        }
        Insert: {
          bundle_id: string
          course_id: string
          created_at?: string
          due_offset_days?: number
          id?: string
          required?: boolean
          sort_order?: number
          tenant_id: string
        }
        Update: {
          bundle_id?: string
          course_id?: string
          created_at?: string
          due_offset_days?: number
          id?: string
          required?: boolean
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "training_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_bundle_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_bundle_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      training_bundles: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          target_role: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          target_role?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          target_role?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_bundles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      training_courses: {
        Row: {
          category: string | null
          content_mode: string
          created_at: string
          created_by: string | null
          description: string | null
          duration_hours: number | null
          external_url: string | null
          id: string
          is_active: boolean
          is_mandatory: boolean
          max_attempts: number | null
          pass_score: number
          provider: string | null
          questions_per_attempt: number | null
          require_lessons_before_quiz: boolean
          shuffle_questions: boolean
          tenant_id: string
          title: string
          updated_at: string
          validity_months: number | null
        }
        Insert: {
          category?: string | null
          content_mode?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          external_url?: string | null
          id?: string
          is_active?: boolean
          is_mandatory?: boolean
          max_attempts?: number | null
          pass_score?: number
          provider?: string | null
          questions_per_attempt?: number | null
          require_lessons_before_quiz?: boolean
          shuffle_questions?: boolean
          tenant_id: string
          title: string
          updated_at?: string
          validity_months?: number | null
        }
        Update: {
          category?: string | null
          content_mode?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          external_url?: string | null
          id?: string
          is_active?: boolean
          is_mandatory?: boolean
          max_attempts?: number | null
          pass_score?: number
          provider?: string | null
          questions_per_attempt?: number | null
          require_lessons_before_quiz?: boolean
          shuffle_questions?: boolean
          tenant_id?: string
          title?: string
          updated_at?: string
          validity_months?: number | null
        }
        Relationships: []
      }
      training_enrollments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          certificate_url: string | null
          completed_at: string | null
          course_id: string
          created_at: string
          due_date: string | null
          employee_id: string
          id: string
          notes: string | null
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["training_enrollment_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          certificate_url?: string | null
          completed_at?: string | null
          course_id: string
          created_at?: string
          due_date?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["training_enrollment_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          certificate_url?: string | null
          completed_at?: string | null
          course_id?: string
          created_at?: string
          due_date?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["training_enrollment_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      training_lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          employee_id: string
          id: string
          lesson_id: string
          started_at: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          employee_id: string
          id?: string
          lesson_id: string
          started_at?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          lesson_id?: string
          started_at?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_lesson_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_lesson_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "training_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "training_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      training_lessons: {
        Row: {
          body: string | null
          content_type: Database["public"]["Enums"]["training_content_type"]
          content_url: string | null
          course_id: string
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          id: string
          is_required: boolean
          sort_order: number
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          content_type?: Database["public"]["Enums"]["training_content_type"]
          content_url?: string | null
          course_id: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          is_required?: boolean
          sort_order?: number
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          content_type?: Database["public"]["Enums"]["training_content_type"]
          content_url?: string | null
          course_id?: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          is_required?: boolean
          sort_order?: number
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quiz_attempts: {
        Row: {
          answers: Json
          attempt_number: number
          attempted_at: string
          course_id: string
          created_at: string
          employee_id: string
          enrollment_id: string
          id: string
          max_score: number
          passed: boolean
          percentage: number
          score: number
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          attempt_number?: number
          attempted_at?: string
          course_id: string
          created_at?: string
          employee_id: string
          enrollment_id: string
          id?: string
          max_score?: number
          passed?: boolean
          percentage?: number
          score?: number
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          attempt_number?: number
          attempted_at?: string
          course_id?: string
          created_at?: string
          employee_id?: string
          enrollment_id?: string
          id?: string
          max_score?: number
          passed?: boolean
          percentage?: number
          score?: number
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_quiz_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_quiz_attempts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_quiz_attempts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "training_quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "training_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quiz_questions: {
        Row: {
          choices: Json
          correct_index: number
          course_id: string
          created_at: string
          created_by: string | null
          explanation: string | null
          id: string
          points: number
          question: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          choices?: Json
          correct_index?: number
          course_id: string
          created_at?: string
          created_by?: string | null
          explanation?: string | null
          id?: string
          points?: number
          question: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          choices?: Json
          correct_index?: number
          course_id?: string
          created_at?: string
          created_by?: string | null
          explanation?: string | null
          id?: string
          points?: number
          question?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_quiz_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wfh_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          decision_note: string | null
          employee_id: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
          work_address: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          decision_note?: string | null
          employee_id: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          status?: string
          tenant_id: string
          updated_at?: string
          work_address?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          decision_note?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          work_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wfh_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wfh_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "wfh_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      white_label_settings: {
        Row: {
          accent_color: string | null
          brand_name: string | null
          created_at: string
          custom_domain: string | null
          email_from_address: string | null
          email_from_name: string | null
          footer_html: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          support_email: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          brand_name?: string | null
          created_at?: string
          custom_domain?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          footer_html?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          support_email?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          brand_name?: string | null
          created_at?: string
          custom_domain?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          footer_html?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          support_email?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "white_label_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      disciplinary_timeline: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          case_id: string | null
          entry_id: string | null
          entry_kind: string | null
          label: string | null
          metadata: Json | null
          notes: string | null
          occurred_at: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string | null
          name: string | null
          priority: string | null
          project_id: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string | null
          name?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string | null
          name?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "toil_balances"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      toil_balances: {
        Row: {
          accrued_hours: number | null
          available_hours: number | null
          consumed_hours: number | null
          employee_id: string | null
          expired_hours: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quiz_questions_public: {
        Row: {
          choices: Json | null
          course_id: string | null
          created_at: string | null
          id: string | null
          points: number | null
          question: string | null
          sort_order: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          choices?: Json | null
          course_id?: string | null
          created_at?: string | null
          id?: string | null
          points?: number | null
          question?: string | null
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          choices?: Json | null
          course_id?: string | null
          created_at?: string | null
          id?: string | null
          points?: number | null
          question?: string | null
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_quiz_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      v_timesheet_variance: {
        Row: {
          attendance_hours: number | null
          claimed_hours: number | null
          employee_id: string | null
          entry_count: number | null
          flag_suspicious: boolean | null
          rostered_hours: number | null
          tenant_id: string | null
          variance_attendance_vs_roster: number | null
          variance_claim_vs_attendance: number | null
          work_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      active_payslip_template: {
        Args: { _country_code: string; _on_date: string }
        Returns: string
      }
      au_payg_lookup: {
        Args: {
          _earnings: number
          _frequency: string
          _on: string
          _scale: string
        }
        Returns: {
          a: number
          b: number
        }[]
      }
      au_sg_rate_on: { Args: { _on: string }; Returns: number }
      award_rate_on: {
        Args: { _classification_id: string; _on: string }
        Returns: {
          allowances: Json
          annual_rate: number | null
          casual_loading_pct: number | null
          classification_id: string
          created_at: string
          effective_from: string
          effective_to: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean
          notes: string | null
          penalty_multipliers: Json
          updated_at: string
          weekly_rate: number | null
        }
        SetofOptions: {
          from: "*"
          to: "award_rates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      blog_publish_due_posts: { Args: never; Returns: number }
      can_decide_wfh: {
        Args: { _request_id: string; _user_id: string }
        Returns: boolean
      }
      can_see_confidential: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_employee_event: { Args: { _event_id: string }; Returns: boolean }
      check_public_rate_limit: {
        Args: {
          _bucket: string
          _client_key: string
          _max_requests: number
          _window_seconds: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          _bucket: string
          _max_requests: number
          _window_seconds: number
        }
        Returns: boolean
      }
      clone_payslip_template: {
        Args: { _template_id: string }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_approved_wfh: {
        Args: { _employee_id: string; _work_date: string }
        Returns: boolean
      }
      has_branch_access: {
        Args: { _branch_id: string; _user_id: string }
        Returns: boolean
      }
      has_country_scope: {
        Args: { _country_code: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_account_active: { Args: { _user_id: string }; Returns: boolean }
      is_branch_admin: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_finance: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_hr: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_manager_of: {
        Args: { _employee_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      list_offboarding_comms_due_reminder: {
        Args: never
        Returns: {
          case_id: string
          channel_label: string
          days_overdue: number
          employee_id: string
          escalate: boolean
          interval_days: number
          row_id: string
          tenant_id: string
        }[]
      }
      list_onboarding_tasks_due_reminder: {
        Args: never
        Returns: {
          assignee_user_id: string
          assignment_id: string
          days_overdue: number
          employee_id: string
          escalate: boolean
          interval_days: number
          task_id: string
          tenant_id: string
          title: string
        }[]
      }
      log_event_access: {
        Args: {
          _action: string
          _employee_id: string
          _metadata: Json
          _resource_id: string
          _resource_type: string
          _was_confidential: boolean
        }
        Returns: string
      }
      merge_checklist_on_country_change: {
        Args: { p_employee: string; p_new_country: string }
        Returns: string
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      my_employee_id: { Args: { _user_id: string }; Returns: string }
      publish_payslip_template: {
        Args: { _effective_from: string; _template_id: string }
        Returns: undefined
      }
      purge_expired_csv_export_files: { Args: never; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      record_employee_event: {
        Args: {
          _category: Database["public"]["Enums"]["event_category"]
          _employee: string
          _event_type: string
          _metadata: Json
          _occurred: string
          _severity: string
          _source_id: string
          _source_table: string
          _summary: string
          _tenant: string
          _title: string
          _visibility: Database["public"]["Enums"]["event_visibility"]
        }
        Returns: string
      }
      revoke_user_sessions: { Args: { _user_id: string }; Returns: number }
      run_audit_retention: {
        Args: never
        Returns: {
          archived: number
          deleted: number
          table_name: string
          tenant_id: string
        }[]
      }
      run_audit_retention_for_tenant: {
        Args: { _tenant_id: string }
        Returns: {
          archived: number
          deleted: number
          error_message: string
          status: string
          table_name: string
        }[]
      }
      seed_country_onboarding_packs: {
        Args: { _tenant: string }
        Returns: undefined
      }
      seed_nepal_payroll: { Args: { p_tenant: string }; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      sweep_public_rate_limits: { Args: never; Returns: number }
      tenant_net_headcount: {
        Args: { _month: number; _tenant: string; _year: number }
        Returns: {
          joined_count: number
          left_count: number
          net_employees: number
        }[]
      }
      tenant_plan_change_days: {
        Args: {
          _change_date: string
          _period_month: number
          _period_year: number
        }
        Returns: {
          days_new: number
          days_prior: number
          days_total: number
        }[]
      }
      tenants_due_for_reminder_now: {
        Args: { _target_hour?: number }
        Returns: {
          local_hour: number
          tenant_id: string
          tz: string
        }[]
      }
      toil_expire_due: { Args: never; Returns: number }
      user_tenant_id: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      account_status: "active" | "suspended"
      app_role:
        | "super_admin"
        | "regional_admin"
        | "org_admin"
        | "manager"
        | "employee"
        | "branch_admin"
        | "hr"
        | "finance"
      asset_category:
        | "laptop"
        | "phone"
        | "tablet"
        | "monitor"
        | "peripheral"
        | "vehicle"
        | "access_card"
        | "sim"
        | "uniform"
        | "tool"
        | "other"
      asset_status:
        | "available"
        | "assigned"
        | "returned"
        | "lost"
        | "damaged"
        | "retired"
      award_status:
        | "open"
        | "nominated"
        | "shortlisted"
        | "awarded"
        | "closed"
        | "cancelled"
      billing_interval: "monthly" | "annual"
      biometric_punch_type: "in" | "out" | "break_in" | "break_out" | "unknown"
      biometric_vendor: "zkteco" | "generic" | "suprema"
      blog_post_status: "draft" | "scheduled" | "published" | "archived"
      document_envelope_status:
        | "draft"
        | "sent"
        | "viewed"
        | "in_progress"
        | "completed"
        | "declined"
        | "cancelled"
        | "expired"
      document_signer_status: "pending" | "viewed" | "signed" | "declined"
      document_template_status: "draft" | "published" | "archived"
      document_type:
        | "employment_contract"
        | "offer_letter"
        | "policy"
        | "hr_letter"
        | "other"
      employee_document_category:
        | "identity"
        | "certificate"
        | "visa"
        | "contract"
        | "signed_document"
        | "letter"
        | "policy_ack"
        | "other"
      employee_document_verification: "unverified" | "verified" | "rejected"
      employee_status: "active" | "on_leave" | "terminated"
      employment_type: "full_time" | "part_time" | "contract" | "intern"
      event_category:
        | "medical"
        | "disciplinary"
        | "grievance"
        | "training"
        | "payroll"
        | "review"
        | "appraisal"
        | "onboarding"
        | "expense"
        | "timesheet"
        | "leave"
        | "document"
        | "recruitment"
        | "promotion"
        | "pay_change"
        | "recognition"
        | "other"
        | "asset"
        | "offboarding"
        | "request"
      event_visibility: "employee" | "manager" | "hr" | "confidential"
      expense_claim_status:
        | "draft"
        | "submitted"
        | "recommended"
        | "approved"
        | "rejected"
        | "paid"
        | "cancelled"
      goal_status: "not_started" | "in_progress" | "completed" | "cancelled"
      leave_request_status: "pending" | "approved" | "rejected" | "cancelled"
      nomination_status:
        | "submitted"
        | "shortlisted"
        | "awarded"
        | "rejected"
        | "withdrawn"
      offboarding_reason:
        | "resignation"
        | "termination"
        | "redundancy"
        | "retirement"
        | "end_of_contract"
        | "mutual_separation"
        | "death"
        | "other"
      offboarding_status:
        | "initiated"
        | "in_progress"
        | "clearance_pending"
        | "completed"
        | "cancelled"
      pay_frequency: "weekly" | "biweekly" | "semimonthly" | "monthly"
      pay_rate_reason:
        | "hire"
        | "promotion"
        | "annual_review"
        | "market_adjustment"
        | "correction"
        | "other"
      pay_rate_status:
        | "proposed"
        | "approved"
        | "rejected"
        | "cancelled"
        | "applied"
      payroll_run_status:
        | "draft"
        | "computed"
        | "pending_approval"
        | "approved"
        | "cancelled"
      payslip_template_status: "draft" | "published" | "archived"
      promotion_status:
        | "proposed"
        | "approved"
        | "rejected"
        | "cancelled"
        | "applied"
      recruitment_candidate_status:
        | "active"
        | "hired"
        | "rejected"
        | "withdrawn"
      recruitment_interview_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "no_show"
      recruitment_job_status: "draft" | "open" | "paused" | "closed" | "filled"
      recruitment_offer_status:
        | "draft"
        | "sent"
        | "accepted"
        | "declined"
        | "expired"
      review_cycle_status: "draft" | "active" | "closed"
      review_status:
        | "draft"
        | "self_submitted"
        | "manager_submitted"
        | "finalized"
        | "acknowledged"
      signature_method: "typed" | "drawn" | "acknowledged"
      subscription_status: "trialing" | "active" | "past_due" | "cancelled"
      support_ticket_category:
        | "stationery"
        | "equipment"
        | "shift_swap"
        | "time_in_lieu"
        | "overtime_payment"
        | "expense_reimbursement"
        | "api_access_request"
        | "other"
      support_ticket_priority: "low" | "normal" | "high" | "urgent"
      support_ticket_status:
        | "open"
        | "in_review"
        | "approved"
        | "rejected"
        | "fulfilled"
        | "closed"
      tenant_status: "pending" | "active" | "suspended" | "cancelled"
      timesheet_status: "draft" | "submitted" | "approved" | "rejected"
      toil_accrual_status: "active" | "expired" | "consumed" | "reversed"
      toil_request_status: "pending" | "approved" | "rejected" | "cancelled"
      toil_source:
        | "overtime"
        | "shift_swap"
        | "penalty"
        | "manual"
        | "adjustment"
      training_content_type:
        | "rich_text"
        | "video"
        | "document"
        | "external_link"
      training_enrollment_status:
        | "assigned"
        | "in_progress"
        | "completed"
        | "expired"
        | "waived"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      account_status: ["active", "suspended"],
      app_role: [
        "super_admin",
        "regional_admin",
        "org_admin",
        "manager",
        "employee",
        "branch_admin",
        "hr",
        "finance",
      ],
      asset_category: [
        "laptop",
        "phone",
        "tablet",
        "monitor",
        "peripheral",
        "vehicle",
        "access_card",
        "sim",
        "uniform",
        "tool",
        "other",
      ],
      asset_status: [
        "available",
        "assigned",
        "returned",
        "lost",
        "damaged",
        "retired",
      ],
      award_status: [
        "open",
        "nominated",
        "shortlisted",
        "awarded",
        "closed",
        "cancelled",
      ],
      billing_interval: ["monthly", "annual"],
      biometric_punch_type: ["in", "out", "break_in", "break_out", "unknown"],
      biometric_vendor: ["zkteco", "generic", "suprema"],
      blog_post_status: ["draft", "scheduled", "published", "archived"],
      document_envelope_status: [
        "draft",
        "sent",
        "viewed",
        "in_progress",
        "completed",
        "declined",
        "cancelled",
        "expired",
      ],
      document_signer_status: ["pending", "viewed", "signed", "declined"],
      document_template_status: ["draft", "published", "archived"],
      document_type: [
        "employment_contract",
        "offer_letter",
        "policy",
        "hr_letter",
        "other",
      ],
      employee_document_category: [
        "identity",
        "certificate",
        "visa",
        "contract",
        "signed_document",
        "letter",
        "policy_ack",
        "other",
      ],
      employee_document_verification: ["unverified", "verified", "rejected"],
      employee_status: ["active", "on_leave", "terminated"],
      employment_type: ["full_time", "part_time", "contract", "intern"],
      event_category: [
        "medical",
        "disciplinary",
        "grievance",
        "training",
        "payroll",
        "review",
        "appraisal",
        "onboarding",
        "expense",
        "timesheet",
        "leave",
        "document",
        "recruitment",
        "promotion",
        "pay_change",
        "recognition",
        "other",
        "asset",
        "offboarding",
        "request",
      ],
      event_visibility: ["employee", "manager", "hr", "confidential"],
      expense_claim_status: [
        "draft",
        "submitted",
        "recommended",
        "approved",
        "rejected",
        "paid",
        "cancelled",
      ],
      goal_status: ["not_started", "in_progress", "completed", "cancelled"],
      leave_request_status: ["pending", "approved", "rejected", "cancelled"],
      nomination_status: [
        "submitted",
        "shortlisted",
        "awarded",
        "rejected",
        "withdrawn",
      ],
      offboarding_reason: [
        "resignation",
        "termination",
        "redundancy",
        "retirement",
        "end_of_contract",
        "mutual_separation",
        "death",
        "other",
      ],
      offboarding_status: [
        "initiated",
        "in_progress",
        "clearance_pending",
        "completed",
        "cancelled",
      ],
      pay_frequency: ["weekly", "biweekly", "semimonthly", "monthly"],
      pay_rate_reason: [
        "hire",
        "promotion",
        "annual_review",
        "market_adjustment",
        "correction",
        "other",
      ],
      pay_rate_status: [
        "proposed",
        "approved",
        "rejected",
        "cancelled",
        "applied",
      ],
      payroll_run_status: [
        "draft",
        "computed",
        "pending_approval",
        "approved",
        "cancelled",
      ],
      payslip_template_status: ["draft", "published", "archived"],
      promotion_status: [
        "proposed",
        "approved",
        "rejected",
        "cancelled",
        "applied",
      ],
      recruitment_candidate_status: [
        "active",
        "hired",
        "rejected",
        "withdrawn",
      ],
      recruitment_interview_status: [
        "scheduled",
        "completed",
        "cancelled",
        "no_show",
      ],
      recruitment_job_status: ["draft", "open", "paused", "closed", "filled"],
      recruitment_offer_status: [
        "draft",
        "sent",
        "accepted",
        "declined",
        "expired",
      ],
      review_cycle_status: ["draft", "active", "closed"],
      review_status: [
        "draft",
        "self_submitted",
        "manager_submitted",
        "finalized",
        "acknowledged",
      ],
      signature_method: ["typed", "drawn", "acknowledged"],
      subscription_status: ["trialing", "active", "past_due", "cancelled"],
      support_ticket_category: [
        "stationery",
        "equipment",
        "shift_swap",
        "time_in_lieu",
        "overtime_payment",
        "expense_reimbursement",
        "api_access_request",
        "other",
      ],
      support_ticket_priority: ["low", "normal", "high", "urgent"],
      support_ticket_status: [
        "open",
        "in_review",
        "approved",
        "rejected",
        "fulfilled",
        "closed",
      ],
      tenant_status: ["pending", "active", "suspended", "cancelled"],
      timesheet_status: ["draft", "submitted", "approved", "rejected"],
      toil_accrual_status: ["active", "expired", "consumed", "reversed"],
      toil_request_status: ["pending", "approved", "rejected", "cancelled"],
      toil_source: [
        "overtime",
        "shift_swap",
        "penalty",
        "manual",
        "adjustment",
      ],
      training_content_type: [
        "rich_text",
        "video",
        "document",
        "external_link",
      ],
      training_enrollment_status: [
        "assigned",
        "in_progress",
        "completed",
        "expired",
        "waived",
      ],
    },
  },
} as const
