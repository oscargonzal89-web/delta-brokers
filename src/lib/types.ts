export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          analista_delta_id: string | null
          analista_legalizacion_id: string | null
          analista_radicacion_id: string | null
          case_id: string
          id: string
          updated_at: string
        }
        Insert: {
          analista_delta_id?: string | null
          analista_legalizacion_id?: string | null
          analista_radicacion_id?: string | null
          case_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          analista_delta_id?: string | null
          analista_legalizacion_id?: string | null
          analista_radicacion_id?: string | null
          case_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cases: {
        Row: {
          banco_actual: string
          ciudad_inmueble: string | null
          created_at: string
          etapa_macro: Database["public"]["Enums"]["etapa_macro"]
          fecha_carta_aprobacion: string | null
          fecha_vencimiento: string | null
          id: string
          monto_a_financiar: number | null
          monto_aprobado: number | null
          monto_desembolsado: number | null
          monto_inmueble: number | null
          person_id: string
          project_id: string
          subestado: string
          updated_at: string
          vigencia_dias: number | null
        }
        Insert: {
          banco_actual: string
          ciudad_inmueble?: string | null
          created_at?: string
          etapa_macro?: Database["public"]["Enums"]["etapa_macro"]
          fecha_carta_aprobacion?: string | null
          fecha_vencimiento?: string | null
          id?: string
          monto_a_financiar?: number | null
          monto_aprobado?: number | null
          monto_desembolsado?: number | null
          monto_inmueble?: number | null
          person_id: string
          project_id: string
          subestado?: string
          updated_at?: string
          vigencia_dias?: number | null
        }
        Update: {
          banco_actual?: string
          ciudad_inmueble?: string | null
          created_at?: string
          etapa_macro?: Database["public"]["Enums"]["etapa_macro"]
          fecha_carta_aprobacion?: string | null
          fecha_vencimiento?: string | null
          id?: string
          monto_a_financiar?: number | null
          monto_aprobado?: number | null
          monto_desembolsado?: number | null
          monto_inmueble?: number | null
          person_id?: string
          project_id?: string
          subestado?: string
          updated_at?: string
          vigencia_dias?: number | null
        }
        Relationships: []
      }
      catalogo_subestados: {
        Row: {
          activo: boolean
          etapa_macro: Database["public"]["Enums"]["etapa_macro"]
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          activo?: boolean
          etapa_macro: Database["public"]["Enums"]["etapa_macro"]
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          activo?: boolean
          etapa_macro?: Database["public"]["Enums"]["etapa_macro"]
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          case_id: string
          fecha_carta: string | null
          file_name: string
          file_url: string
          id: string
          tipo: Database["public"]["Enums"]["tipo_documento"]
          uploaded_at: string
          uploaded_by: string | null
          vigencia_dias: number | null
        }
        Insert: {
          case_id: string
          fecha_carta?: string | null
          file_name: string
          file_url: string
          id?: string
          tipo: Database["public"]["Enums"]["tipo_documento"]
          uploaded_at?: string
          uploaded_by?: string | null
          vigencia_dias?: number | null
        }
        Update: {
          case_id?: string
          fecha_carta?: string | null
          file_name?: string
          file_url?: string
          id?: string
          tipo?: Database["public"]["Enums"]["tipo_documento"]
          uploaded_at?: string
          uploaded_by?: string | null
          vigencia_dias?: number | null
        }
        Relationships: []
      }
      event_logs: {
        Row: {
          actor_user_id: string | null
          case_id: string
          comment: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["tipo_evento"]
          id: string
          payload: Json
        }
        Insert: {
          actor_user_id?: string | null
          case_id: string
          comment?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["tipo_evento"]
          id?: string
          payload?: Json
        }
        Update: {
          actor_user_id?: string | null
          case_id?: string
          comment?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["tipo_evento"]
          id?: string
          payload?: Json
        }
        Relationships: []
      }
      import_row_errors: {
        Row: {
          field: string
          id: string
          import_id: string
          message: string
          raw_value: string | null
          row_number: number
        }
        Insert: {
          field: string
          id?: string
          import_id: string
          message: string
          raw_value?: string | null
          row_number: number
        }
        Update: {
          field?: string
          id?: string
          import_id?: string
          message?: string
          raw_value?: string | null
          row_number?: number
        }
        Relationships: []
      }
      imports: {
        Row: {
          error_count: number
          file_name: string
          file_url: string | null
          id: string
          inserted_count: number
          project_id: string
          status: Database["public"]["Enums"]["import_status"]
          updated_count: number
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          error_count?: number
          file_name: string
          file_url?: string | null
          id?: string
          inserted_count?: number
          project_id: string
          status?: Database["public"]["Enums"]["import_status"]
          updated_count?: number
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          error_count?: number
          file_name?: string
          file_url?: string | null
          id?: string
          inserted_count?: number
          project_id?: string
          status?: Database["public"]["Enums"]["import_status"]
          updated_count?: number
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      persons: {
        Row: {
          apellidos: string
          cedula: string
          ciudad_cliente: string | null
          created_at: string
          fecha_nacimiento: string | null
          id: string
          nombres: string
        }
        Insert: {
          apellidos: string
          cedula: string
          ciudad_cliente?: string | null
          created_at?: string
          fecha_nacimiento?: string | null
          id?: string
          nombres: string
        }
        Update: {
          apellidos?: string
          cedula?: string
          ciudad_cliente?: string | null
          created_at?: string
          fecha_nacimiento?: string | null
          id?: string
          nombres?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          banco_financiador_principal: string
          ciudad: string
          created_at: string
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          banco_financiador_principal: string
          ciudad: string
          created_at?: string
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          banco_financiador_principal?: string
          ciudad?: string
          created_at?: string
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activo: boolean
          created_at: string
          email: string
          id: string
          nombre: string
          rol: Database["public"]["Enums"]["rol_usuario"]
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          email: string
          id: string
          nombre: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          email?: string
          id?: string
          nombre?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_cases_with_details: {
        Row: {
          analista_delta_id: string | null
          analista_delta_nombre: string | null
          analista_legalizacion_id: string | null
          analista_legalizacion_nombre: string | null
          analista_radicacion_id: string | null
          analista_radicacion_nombre: string | null
          apellidos: string | null
          banco_actual: string | null
          banco_financiador_principal: string | null
          case_created_at: string | null
          case_id: string | null
          case_updated_at: string | null
          cedula: string | null
          ciudad_cliente: string | null
          ciudad_inmueble: string | null
          dias_restantes: number | null
          etapa_macro: Database["public"]["Enums"]["etapa_macro"] | null
          fecha_carta_aprobacion: string | null
          fecha_nacimiento: string | null
          fecha_vencimiento: string | null
          monto_a_financiar: number | null
          monto_aprobado: number | null
          monto_desembolsado: number | null
          monto_inmueble: number | null
          nombre_completo: string | null
          nombres: string | null
          person_id: string | null
          project_id: string | null
          proyecto_ciudad: string | null
          proyecto_nombre: string | null
          subestado: string | null
          vigencia_dias: number | null
        }
        Relationships: []
      }
      v_dashboard_kpis: {
        Row: {
          aprobacion: number | null
          ciudad: string | null
          desembolsado: number | null
          legalizacion: number | null
          por_vencer: number | null
          preaprobacion: number | null
          project_id: string | null
          proyecto_nombre: string | null
          total_clientes: number | null
          vencidos: number | null
        }
        Relationships: []
      }
      v_seguimiento_analistas: {
        Row: {
          analista_id: string | null
          analista_nombre: string | null
          aprobacion: number | null
          desembolsado: number | null
          legalizacion: number | null
          por_vencer: number | null
          preaprobacion: number | null
          project_id: string | null
          proyecto_ciudad: string | null
          proyecto_nombre: string | null
          total_creditos: number | null
          vencidos: number | null
        }
        Relationships: []
      }
      v_subestados_por_proyecto: {
        Row: {
          cantidad: number | null
          etapa_macro: Database["public"]["Enums"]["etapa_macro"] | null
          project_id: string | null
          subestado: string | null
        }
        Relationships: []
      }
      v_vencimientos_por_rango: {
        Row: {
          analista_delta_id: string | null
          analista_delta_nombre: string | null
          analista_legalizacion_id: string | null
          analista_legalizacion_nombre: string | null
          analista_radicacion_id: string | null
          analista_radicacion_nombre: string | null
          apellidos: string | null
          banco_actual: string | null
          banco_financiador_principal: string | null
          case_created_at: string | null
          case_id: string | null
          case_updated_at: string | null
          cedula: string | null
          ciudad_cliente: string | null
          ciudad_inmueble: string | null
          dias_restantes: number | null
          etapa_macro: Database["public"]["Enums"]["etapa_macro"] | null
          fecha_carta_aprobacion: string | null
          fecha_nacimiento: string | null
          fecha_vencimiento: string | null
          monto_a_financiar: number | null
          monto_aprobado: number | null
          monto_desembolsado: number | null
          monto_inmueble: number | null
          nombre_completo: string | null
          nombres: string | null
          person_id: string | null
          project_id: string | null
          proyecto_ciudad: string | null
          proyecto_nombre: string | null
          rango_vencimiento: string | null
          subestado: string | null
          vigencia_dias: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      change_case_bank: {
        Args: { p_case_id: string; p_comment?: string; p_nuevo_banco: string }
        Returns: undefined
      }
      change_case_status: {
        Args: {
          p_case_id: string
          p_comment?: string
          p_etapa: Database["public"]["Enums"]["etapa_macro"]
          p_subestado: string
        }
        Returns: undefined
      }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["rol_usuario"]
      }
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_coordinator_or_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      etapa_macro: "preaprobacion" | "aprobacion" | "legalizacion" | "desembolsado"
      import_status: "processing" | "completed" | "failed"
      rol_usuario: "analista" | "coordinador" | "administrador"
      tipo_documento: "carta_preaprobacion" | "carta_aprobacion"
      tipo_evento:
        | "STATUS_CHANGED"
        | "BANK_CHANGED"
        | "ASSIGNMENT_CHANGED"
        | "DOC_UPLOADED"
        | "IMPORTED_CREATED"
        | "IMPORTED_UPDATED"
        | "COMMENT_ADDED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

export type Project = Tables<"projects">
export type Person = Tables<"persons">
export type Case = Tables<"cases">
export type Assignment = Tables<"assignments">
export type Document = Tables<"documents">
export type Import = Tables<"imports">
export type ImportRowError = Tables<"import_row_errors">
export type EventLog = Tables<"event_logs">
export type UserProfile = Tables<"user_profiles">
export type CatalogoSubestado = Tables<"catalogo_subestados">

export type CaseWithDetails = Views<"v_cases_with_details">
export type DashboardKpi = Views<"v_dashboard_kpis">
export type SeguimientoAnalista = Views<"v_seguimiento_analistas">
export type VencimientoPorRango = Views<"v_vencimientos_por_rango">
export type SubestadoPorProyecto = Views<"v_subestados_por_proyecto">

export type EtapaMacro = Enums<"etapa_macro">
export type RolUsuario = Enums<"rol_usuario">
export type TipoDocumento = Enums<"tipo_documento">
export type TipoEvento = Enums<"tipo_evento">
export type ImportStatus = Enums<"import_status">
