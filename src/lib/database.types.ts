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
          store_id: string | null
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
          store_id?: string | null
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
          store_id?: string | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_checkouts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
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
          store_id: string | null
          value: string
        }
        Insert: {
          category: string
          id?: string
          key: string
          sort_order?: number | null
          store_id?: string | null
          value: string
        }
        Update: {
          category?: string
          id?: string
          key?: string
          sort_order?: number | null
          store_id?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "attribute_options_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
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
          store_id: string | null
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
          store_id?: string | null
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
          store_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "banners_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          cart_content: Json | null
          contact_info: Json | null
          created_at: string | null
          id: string
          session_id: string | null
          status: string | null
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          cart_content?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cart_content?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      category_metadata: {
        Row: {
          created_at: string | null
          image_url: string | null
          show_overlay: boolean | null
          slug: string
          sort_order: number | null
          store_id: string
          subtitle: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          image_url?: string | null
          show_overlay?: boolean | null
          slug: string
          sort_order?: number | null
          store_id: string
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          image_url?: string | null
          show_overlay?: boolean | null
          slug?: string
          sort_order?: number | null
          store_id?: string
          subtitle?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_metadata_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
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
          store_id: string | null
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
          store_id?: string | null
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
          store_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_sections_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
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
          store_id: string | null
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
          store_id?: string | null
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
          store_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_configs: {
        Row: {
          created_at: string | null
          data_config: Json | null
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number | null
          store_id: string | null
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
          store_id?: string | null
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
          store_id?: string | null
          title?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_configs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          image_url: string | null
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          sku: string | null
          unit_price: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          id?: string
          image_url?: string | null
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          sku?: string | null
          unit_price: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          id?: string
          image_url?: string | null
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          sku?: string | null
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
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_notes: string | null
          id: string
          payment_method: string | null
          status: string | null
          store_id: string | null
          total_amount: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_notes?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          store_id?: string | null
          total_amount: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_notes?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          store_id?: string | null
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_360_sets: {
        Row: {
          created_at: string | null
          frame_urls: string[]
          id: string
          product_id: string
          store_id: string
        }
        Insert: {
          created_at?: string | null
          frame_urls: string[]
          id?: string
          product_id: string
          store_id: string
        }
        Update: {
          created_at?: string | null
          frame_urls?: string[]
          id?: string
          product_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_360_sets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_360_sets_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          condition: string
          created_at: string | null
          deleted_at: string | null
          id: string
          images: string[] | null
          original_price: number | null
          price: number
          product_id: string | null
          sku: string | null
          specs: Json | null
          stock: number | null
        }
        Insert: {
          condition: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          images?: string[] | null
          original_price?: number | null
          price: number
          product_id?: string | null
          sku?: string | null
          specs?: Json | null
          stock?: number | null
        }
        Update: {
          condition?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          images?: string[] | null
          original_price?: number | null
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
          store_id: string | null
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
          store_id?: string | null
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
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          digital_address: string | null
          email: string | null
          full_name: string | null
          government_id: string | null
          id: string
          phone: string | null
          shipping_address: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          digital_address?: string | null
          email?: string | null
          full_name?: string | null
          government_id?: string | null
          id: string
          phone?: string | null
          shipping_address?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          digital_address?: string | null
          email?: string | null
          full_name?: string | null
          government_id?: string | null
          id?: string
          phone?: string | null
          shipping_address?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          store_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          store_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          owner_id: string | null
          plan_id: string
          settings: Json | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          owner_id?: string | null
          plan_id?: string
          settings?: Json | null
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_id?: string | null
          plan_id?: string
          settings?: Json | null
          slug?: string
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
