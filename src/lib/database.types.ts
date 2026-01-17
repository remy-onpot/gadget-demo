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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abandoned_checkouts: {
        Row: {
          cart_items: Json | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          phone: string | null
          recovered: boolean | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          cart_items?: Json | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          phone?: string | null
          recovered?: boolean | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          cart_items?: Json | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          recovered?: boolean | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      attribute_options: {
        Row: {
          category: string
          id: string
          key: string
          sort_order: number | null
          value: string
        }
        Insert: {
          category: string
          id?: string
          key: string
          sort_order?: number | null
          value: string
        }
        Update: {
          category?: string
          id?: string
          key?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          bg_color: string | null
          created_at: string | null
          cta_text: string | null
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          label: string | null
          link_url: string
          slot: string
          title: string
        }
        Insert: {
          bg_color?: string | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          label?: string | null
          link_url: string
          slot: string
          title: string
        }
        Update: {
          bg_color?: string | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          label?: string | null
          link_url?: string
          slot?: string
          title?: string
        }
        Relationships: []
      }
      carts: {
        Row: {
          cart_content: Json | null
          contact_info: Json | null
          created_at: string | null
          id: string
          session_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cart_content?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cart_content?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      category_metadata: {
        Row: {
          created_at: string | null
          image_url: string | null
          show_overlay: boolean | null
          slug: string
          sort_order: number | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          image_url?: string | null
          show_overlay?: boolean | null
          slug: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          image_url?: string | null
          show_overlay?: boolean | null
          slug?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      category_sections: {
        Row: {
          category_slug: string
          created_at: string | null
          filter_rules: Json | null
          id: string
          is_active: boolean | null
          section_type: string
          sort_order: number | null
          title: string
        }
        Insert: {
          category_slug: string
          created_at?: string | null
          filter_rules?: Json | null
          id?: string
          is_active?: boolean | null
          section_type: string
          sort_order?: number | null
          title: string
        }
        Update: {
          category_slug?: string
          created_at?: string | null
          filter_rules?: Json | null
          id?: string
          is_active?: boolean | null
          section_type?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          block_key: string
          created_at: string | null
          description: string | null
          icon_key: string | null
          id: string
          meta_info: Json | null
          section_key: string
          sort_order: number | null
          title: string | null
        }
        Insert: {
          block_key: string
          created_at?: string | null
          description?: string | null
          icon_key?: string | null
          id?: string
          meta_info?: Json | null
          section_key: string
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          block_key?: string
          created_at?: string | null
          description?: string | null
          icon_key?: string | null
          id?: string
          meta_info?: Json | null
          section_key?: string
          sort_order?: number | null
          title?: string | null
        }
        Relationships: []
      }
      feed_configs: {
        Row: {
          created_at: string | null
          data_config: Json | null
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number | null
          title: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          data_config?: Json | null
          id?: string
          is_active?: boolean | null
          slug: string
          sort_order?: number | null
          title?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          data_config?: Json | null
          id?: string
          is_active?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string | null
          type?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_notes: string | null
          id: string
          payment_method: string | null
          status: string | null
          total_amount: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_notes?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          total_amount: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_notes?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          total_amount?: number
          user_id?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          condition: string
          created_at: string | null
          id: string
          images: string[] | null
          price: number
          product_id: string | null
          sku: string | null
          specs: Json | null
          stock: number | null
        }
        Insert: {
          condition: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          price: number
          product_id?: string | null
          sku?: string | null
          specs?: Json | null
          stock?: number | null
        }
        Update: {
          condition?: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          price?: number
          product_id?: string | null
          sku?: string | null
          specs?: Json | null
          stock?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_images: string[] | null
          base_price: number
          brand: string
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          slug: string
        }
        Insert: {
          base_images?: string[] | null
          base_price: number
          brand: string
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          slug: string
        }
        Update: {
          base_images?: string[] | null
          base_price?: number
          brand?: string
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          shipping_address: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          shipping_address?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          shipping_address?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          label: string | null
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          label?: string | null
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          label?: string | null
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
