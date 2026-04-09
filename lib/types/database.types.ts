export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    PostgrestVersion: "12"
    Tables: {
      alumnos: {
        Row: {
          created_at:      string
          curso_id:        string
          id:              string
          nombre_completo: string
          rut:             string | null
        }
        Insert: {
          created_at?:     string
          curso_id:        string
          id?:             string
          nombre_completo: string
          rut?:            string | null
        }
        Update: {
          created_at?:     string
          curso_id?:       string
          id?:             string
          nombre_completo?: string
          rut?:            string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumnos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      apoderado_alumno: {
        Row: {
          alumno_id:    string
          apoderado_id: string
          curso_id:     string
        }
        Insert: {
          alumno_id:    string
          apoderado_id: string
          curso_id:     string
        }
        Update: {
          alumno_id?:    string
          apoderado_id?: string
          curso_id?:     string
        }
        Relationships: [
          {
            foreignKeyName: "apoderado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apoderado_alumno_apoderado_id_fkey"
            columns: ["apoderado_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apoderado_alumno_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      auditoria: {
        Row: {
          campo_modificado: string
          created_at:       string
          id:               string
          ip_address:       string | null
          justificacion:    string
          registro_id:      string
          tabla_afectada:   string
          usuario_id:       string
          valor_anterior:   Json | null
          valor_nuevo:      Json | null
        }
        Insert: {
          campo_modificado: string
          created_at?:      string
          id?:              string
          ip_address?:      string | null
          justificacion:    string
          registro_id:      string
          tabla_afectada:   string
          usuario_id:       string
          valor_anterior?:  Json | null
          valor_nuevo?:     Json | null
        }
        Update: {
          campo_modificado?: string
          created_at?:       string
          id?:               string
          ip_address?:       string | null
          justificacion?:    string
          registro_id?:      string
          tabla_afectada?:   string
          usuario_id?:       string
          valor_anterior?:   Json | null
          valor_nuevo?:      Json | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billeteras: {
        Row: {
          curso_id:   string
          id:         string
          saldo:      number
          tipo:       Database["public"]["Enums"]["tipo_billetera"]
          updated_at: string
        }
        Insert: {
          curso_id:    string
          id?:         string
          saldo?:      number
          tipo:        Database["public"]["Enums"]["tipo_billetera"]
          updated_at?: string
        }
        Update: {
          curso_id?:   string
          id?:         string
          saldo?:      number
          tipo?:       Database["public"]["Enums"]["tipo_billetera"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billeteras_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          activo:            boolean
          anio_escolar:      number
          colegio:           string
          codigo_invitacion: string
          created_at:        string
          fecha_inicio:      string
          fundador_id:       string | null
          id:                string
          modo_en_marcha:    boolean
          nivel:             string | null
          nombre:            string
          updated_at:        string
        }
        Insert: {
          activo?:            boolean
          anio_escolar?:      number
          colegio:            string
          codigo_invitacion?: string
          created_at?:        string
          fecha_inicio?:      string
          fundador_id?:       string | null
          id?:                string
          modo_en_marcha?:    boolean
          nivel?:             string | null
          nombre:             string
          updated_at?:        string
        }
        Update: {
          activo?:            boolean
          anio_escolar?:      number
          colegio?:           string
          codigo_invitacion?: string
          created_at?:        string
          fecha_inicio?:      string
          fundador_id?:       string | null
          id?:                string
          modo_en_marcha?:    boolean
          nivel?:             string | null
          nombre?:            string
          updated_at?:        string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cursos_fundador"
            columns: ["fundador_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cuotas: {
        Row: {
          apoderado_id:         string
          cantidad_alumnos:     number
          created_at:           string
          curso_id:             string
          evento_id:            string
          fecha_pago:           string | null
          id:                   string
          monto_total:          number        // GENERATED ALWAYS AS
          monto_unitario:       number
          pagado:               boolean
          saldo_favor_aplicado: number
        }
        Insert: {
          apoderado_id:          string
          cantidad_alumnos?:     number
          created_at?:           string
          curso_id:              string
          evento_id:             string
          fecha_pago?:           string | null
          id?:                   string
          monto_unitario:        number
          pagado?:               boolean
          saldo_favor_aplicado?: number
        }
        Update: {
          apoderado_id?:         string
          cantidad_alumnos?:     number
          created_at?:           string
          curso_id?:             string
          evento_id?:            string
          fecha_pago?:           string | null
          id?:                   string
          monto_unitario?:       number
          pagado?:               boolean
          saldo_favor_aplicado?: number
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_apoderado_id_fkey"
            columns: ["apoderado_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          created_at:        string
          creado_por:        string
          curso_id:          string
          descripcion:       string | null
          destino_sobrante:  Database["public"]["Enums"]["destino_sobrante"] | null
          estado:            Database["public"]["Enums"]["estado_evento"]
          fecha_limite_pago: string
          id:                string
          monto_objetivo:    number
          monto_por_alumno:  number
          nombre:            string
          sobrante_monto:    number | null
          tipo_billetera:    Database["public"]["Enums"]["tipo_billetera"]
          updated_at:        string
        }
        Insert: {
          created_at?:        string
          creado_por:         string
          curso_id:           string
          descripcion?:       string | null
          destino_sobrante?:  Database["public"]["Enums"]["destino_sobrante"] | null
          estado?:            Database["public"]["Enums"]["estado_evento"]
          fecha_limite_pago:  string
          id?:                string
          monto_objetivo:     number
          monto_por_alumno:   number
          nombre:             string
          sobrante_monto?:    number | null
          tipo_billetera:     Database["public"]["Enums"]["tipo_billetera"]
          updated_at?:        string
        }
        Update: {
          created_at?:        string
          creado_por?:        string
          curso_id?:          string
          descripcion?:       string | null
          destino_sobrante?:  Database["public"]["Enums"]["destino_sobrante"] | null
          estado?:            Database["public"]["Enums"]["estado_evento"]
          fecha_limite_pago?: string
          id?:                string
          monto_objetivo?:    number
          monto_por_alumno?:  number
          nombre?:            string
          sobrante_monto?:    number | null
          tipo_billetera?:    Database["public"]["Enums"]["tipo_billetera"]
          updated_at?:        string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      fondo_reserva: {
        Row: {
          curso_id:   string
          id:         string
          saldo:      number
          updated_at: string
        }
        Insert: {
          curso_id:    string
          id?:         string
          saldo?:      number
          updated_at?: string
        }
        Update: {
          curso_id?:   string
          id?:         string
          saldo?:      number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fondo_reserva_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: true
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          aprobado_por:             string | null
          created_at:               string
          curso_id:                 string
          estado:                   Database["public"]["Enums"]["estado_usuario"]
          fecha_aprobacion:         string | null
          id:                       string
          nombre_completo:          string
          rol:                      Database["public"]["Enums"]["rol_usuario"]
          rut:                      string
          telefono:                 string
          ultimo_evento_propuesto:  string | null
          updated_at:               string
        }
        Insert: {
          aprobado_por?:            string | null
          created_at?:              string
          curso_id:                 string
          estado?:                  Database["public"]["Enums"]["estado_usuario"]
          fecha_aprobacion?:        string | null
          id:                       string
          nombre_completo:          string
          rol?:                     Database["public"]["Enums"]["rol_usuario"]
          rut:                      string
          telefono:                 string
          ultimo_evento_propuesto?: string | null
          updated_at?:              string
        }
        Update: {
          aprobado_por?:            string | null
          created_at?:              string
          curso_id?:                string
          estado?:                  Database["public"]["Enums"]["estado_usuario"]
          fecha_aprobacion?:        string | null
          id?:                      string
          nombre_completo?:         string
          rol?:                     Database["public"]["Enums"]["rol_usuario"]
          rut?:                     string
          telefono?:                string
          ultimo_evento_propuesto?: string | null
          updated_at?:              string
        }
        Relationships: [
          {
            foreignKeyName: "perfiles_aprobado_por_fkey"
            columns: ["aprobado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfiles_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saldo_favor: {
        Row: {
          apoderado_id: string
          curso_id:     string
          id:           string
          saldo:        number
          updated_at:   string
        }
        Insert: {
          apoderado_id: string
          curso_id:     string
          id?:          string
          saldo?:       number
          updated_at?:  string
        }
        Update: {
          apoderado_id?: string
          curso_id?:     string
          id?:           string
          saldo?:        number
          updated_at?:   string
        }
        Relationships: [
          {
            foreignKeyName: "saldo_favor_apoderado_id_fkey"
            columns: ["apoderado_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saldo_favor_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      transacciones: {
        Row: {
          aprobado_por:          string | null
          auto_validacion_fecha: string | null  // GENERATED ALWAYS AS
          created_at:            string
          cuota_id:              string | null
          curso_id:              string
          descripcion:           string
          estado:                Database["public"]["Enums"]["estado_transaccion"]
          evento_id:             string | null
          fecha_aprobacion:      string | null
          fecha_registro:        string
          fecha_validacion:      string | null
          id:                    string
          monto:                 number
          numero_boleta:         string | null
          registrado_por:        string
          tipo:                  Database["public"]["Enums"]["tipo_transaccion"]
          url_comprobante:       string | null
          validado_por:          string | null
          votacion_id:           string | null
        }
        Insert: {
          aprobado_por?:     string | null
          created_at?:       string
          cuota_id?:         string | null
          curso_id:          string
          descripcion:       string
          estado?:           Database["public"]["Enums"]["estado_transaccion"]
          evento_id?:        string | null
          fecha_aprobacion?: string | null
          fecha_registro?:   string
          fecha_validacion?: string | null
          id?:               string
          monto:             number
          numero_boleta?:    string | null
          registrado_por:    string
          tipo:              Database["public"]["Enums"]["tipo_transaccion"]
          url_comprobante?:  string | null
          validado_por?:     string | null
          votacion_id?:      string | null
        }
        Update: {
          // monto, tipo, curso_id son inmutables (protegidos por trigger)
          aprobado_por?:     string | null
          descripcion?:      string
          estado?:           Database["public"]["Enums"]["estado_transaccion"]
          fecha_aprobacion?: string | null
          fecha_validacion?: string | null
          id?:               string
          numero_boleta?:    string | null
          url_comprobante?:  string | null
          validado_por?:     string | null
          votacion_id?:      string | null
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_aprobado_por_fkey"
            columns: ["aprobado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_validado_por_fkey"
            columns: ["validado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_votacion_id_fkey"
            columns: ["votacion_id"]
            isOneToOne: false
            referencedRelation: "votaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      votaciones: {
        Row: {
          created_at:                 string
          creado_por:                 string
          curso_id:                   string
          estado:                     Database["public"]["Enums"]["estado_votacion"]
          evento_id:                  string | null
          fecha_fin:                  string | null
          fecha_inicio:               string | null
          fecha_veto:                 string | null
          id:                         string
          justificacion_veto:         string | null
          quorum_requerido:           number | null
          tipo:                       Database["public"]["Enums"]["tipo_votacion"]
          total_votantes_habilitados: number
          updated_at:                 string
          vetada_por:                 string | null
          votacion_anterior_id:       string | null
          votos_abstencion:           number
          votos_no:                   number
          votos_si:                   number
          vuelta:                     number
        }
        Insert: {
          created_at?:                 string
          creado_por:                  string
          curso_id:                    string
          estado?:                     Database["public"]["Enums"]["estado_votacion"]
          evento_id?:                  string | null
          fecha_fin?:                  string | null
          fecha_inicio?:               string | null
          fecha_veto?:                 string | null
          id?:                         string
          justificacion_veto?:         string | null
          quorum_requerido?:           number | null
          tipo:                        Database["public"]["Enums"]["tipo_votacion"]
          total_votantes_habilitados?: number
          updated_at?:                 string
          vetada_por?:                 string | null
          votacion_anterior_id?:       string | null
          votos_abstencion?:           number
          votos_no?:                   number
          votos_si?:                   number
          vuelta?:                     number
        }
        Update: {
          created_at?:                 string
          estado?:                     Database["public"]["Enums"]["estado_votacion"]
          fecha_fin?:                  string | null
          fecha_inicio?:               string | null
          fecha_veto?:                 string | null
          id?:                         string
          justificacion_veto?:         string | null
          quorum_requerido?:           number | null
          total_votantes_habilitados?: number
          updated_at?:                 string
          vetada_por?:                 string | null
          votacion_anterior_id?:       string | null
          votos_abstencion?:           number
          votos_no?:                   number
          votos_si?:                   number
          vuelta?:                     number
        }
        Relationships: [
          {
            foreignKeyName: "votaciones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votaciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votaciones_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votaciones_vetada_por_fkey"
            columns: ["vetada_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votaciones_votacion_anterior_id_fkey"
            columns: ["votacion_anterior_id"]
            isOneToOne: false
            referencedRelation: "votaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      votos: {
        Row: {
          fecha:       string
          id:          string
          opcion:      Database["public"]["Enums"]["opcion_voto"]
          usuario_id:  string
          votacion_id: string
        }
        Insert: {
          fecha?:      string
          id?:         string
          opcion:      Database["public"]["Enums"]["opcion_voto"]
          usuario_id:  string
          votacion_id: string
        }
        Update: {
          fecha?:       string
          id?:          string
          opcion?:      Database["public"]["Enums"]["opcion_voto"]
          usuario_id?:  string
          votacion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votos_votacion_id_fkey"
            columns: ["votacion_id"]
            isOneToOne: false
            referencedRelation: "votaciones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cuotas_vista: {
        Row: {
          apoderado_id:         string | null   // NULL si está censurado (Regla 70%)
          cantidad_alumnos:     number | null
          created_at:           string | null
          curso_id:             string | null
          evento_id:            string | null
          fecha_pago:           string | null
          id:                   string | null
          identidad_revelada:   boolean | null  // Indicador UI de censura
          monto_total:          number | null
          monto_unitario:       number | null
          pagado:               boolean | null
          saldo_favor_aplicado: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      fn_ajustar_transaccion: {
        Args: {
          p_transaccion_id: string
          p_campo:          string
          p_valor_nuevo:    string
          p_justificacion:  string
        }
        Returns: undefined
      }
      fn_auto_validar_transacciones: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fn_inicializar_curso: {
        Args: { p_curso_id: string }
        Returns: undefined
      }
      get_user_curso_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_rol: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["rol_usuario"]
      }
      is_jerarquia: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_tesorero_o_superior: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      destino_sobrante:    "fondo_reserva" | "saldo_favor"
      estado_evento:       "borrador" | "activo" | "cerrado" | "cancelado"
      estado_transaccion:  "pendiente_aprobacion" | "pendiente_validacion" | "aprobada" | "rechazada"
      estado_usuario:      "pendiente" | "activo" | "rechazado" | "suspendido"
      estado_votacion:     "primera_vuelta" | "segunda_vuelta" | "aprobada" | "rechazada" | "vetada" | "expirada"
      opcion_voto:         "si" | "no" | "abstencion"
      rol_usuario:         "fundador" | "presidente" | "tesorero" | "secretario" | "profesor_jefe" | "alumno" | "apoderado"
      tipo_billetera:      "alumnos" | "apoderados"
      tipo_transaccion:    "cuota_ingreso" | "gasto_egreso" | "sobrante_a_reserva" | "sobrante_a_saldo_favor" | "ajuste_descripcion"
      tipo_votacion:       "gasto" | "cierre_evento" | "destino_sobrante"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ── Helpers de tipo generados (patrón oficial Supabase) ───────────────────────

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
