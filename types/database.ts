export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    CompositeTypes: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Tables: {
      care_logs: {
        Insert: {
          care_schedule_id?: string | null
          care_type?: string | null
          completed_at: string
          created_at?: string | null
          id?: string
          notes?: string | null
          photos?: Json | null
          user_plant_id?: string | null
        }
        Row: {
          care_schedule_id: string | null
          care_type: string | null
          completed_at: string
          created_at: string | null
          id: string
          notes: string | null
          photos: Json | null
          user_plant_id: string | null
        }
        Update: {
          care_schedule_id?: string | null
          care_type?: string | null
          completed_at?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          photos?: Json | null
          user_plant_id?: string | null
        }
      }
      care_schedules: {
        Insert: {
          care_type?: string | null
          created_at?: string | null
          frequency_days: number
          id?: string
          is_active?: boolean | null
          last_completed_at?: string | null
          next_due_at?: string | null
          updated_at?: string | null
          user_plant_id?: string | null
        }
        Row: {
          care_type: string | null
          created_at: string | null
          frequency_days: number
          id: string
          is_active: boolean | null
          last_completed_at: string | null
          next_due_at: string | null
          updated_at: string | null
          user_plant_id: string | null
        }
        Update: {
          care_type?: string | null
          created_at?: string | null
          frequency_days?: number
          id?: string
          is_active?: boolean | null
          last_completed_at?: string | null
          next_due_at?: string | null
          updated_at?: string | null
          user_plant_id?: string | null
        }
      }
      cart: {
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          updated_at: string | null
          user_id: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
      }
      categories: {
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
      }
      order_items: {
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price_at_purchase: number
          product_id?: string | null
          quantity: number
        }
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price_at_purchase: number
          product_id: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price_at_purchase?: number
          product_id?: string | null
          quantity?: number
        }
      }
      orders: {
        Insert: {
          created_at?: string | null
          id?: string
          payment_status?: string | null
          shipping_address?: Json | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Row: {
          created_at: string | null
          id: string
          payment_status: string | null
          shipping_address: Json | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_status?: string | null
          shipping_address?: Json | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
      }
      products: {
        Insert: {
          care_instructions?: Json | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          images?: Json | null
          is_plant?: boolean | null
          name: string
          price: number
          slug: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Row: {
          care_instructions: Json | null
          category_id: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          images: { gallery: string[]; main: string; }
          is_plant: boolean | null
          name: string
          price: number
          slug: string
          stock_quantity: number
          updated_at: string | null
        }
        Update: {
          care_instructions?: Json | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          images?: Json | null
          is_plant?: boolean | null
          name?: string
          price?: number
          slug?: string
          stock_quantity?: number
          updated_at?: string | null
        }
      }
      reminders: {
        Insert: {
          care_schedule_id?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_sent?: boolean | null
          reminder_type?: string | null
          scheduled_for?: string | null
          user_id?: string | null
          user_plant_id?: string | null
        }
        Row: {
          care_schedule_id: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          is_sent: boolean | null
          reminder_type: string | null
          scheduled_for: string | null
          user_id: string | null
          user_plant_id: string | null
        }
        Update: {
          care_schedule_id?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_sent?: boolean | null
          reminder_type?: string | null
          scheduled_for?: string | null
          user_id?: string | null
          user_plant_id?: string | null
        }
      }
      user_plants: {
        Insert: {
          acquisition_date?: string | null
          created_at?: string | null
          custom_name?: string | null
          id?: string
          image_url?: string | null
          is_from_purchase?: boolean | null
          location?: string | null
          notes?: string | null
          plant_type?: string | null
          product_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Row: {
          acquisition_date: string | null
          created_at: string | null
          custom_name: string | null
          id: string
          image_url: string | null
          is_from_purchase: boolean | null
          location: string | null
          notes: string | null
          plant_type: string | null
          product_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Update: {
          acquisition_date?: string | null
          created_at?: string | null
          custom_name?: string | null
          id?: string
          image_url?: string | null
          is_from_purchase?: boolean | null
          location?: string | null
          notes?: string | null
          plant_type?: string | null
          product_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
      }
      users: {
        Insert: {
          addresses?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Row: {
          addresses: Json | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Update: {
          addresses?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
  }
}

// Care Instructions Types
export interface CareInstructionItem {
  difficulty: number // 1-5 scale
  text: string
}

export interface PlantCareInstructions {
  fertilizer: CareInstructionItem
  humidity: CareInstructionItem
  light: CareInstructionItem
  temperature: CareInstructionItem
  water: CareInstructionItem
}

export interface ProductCareInstructions {
  [key: string]: CareInstructionItem
}

export type CareInstructions = PlantCareInstructions | ProductCareInstructions

// Product type with proper care_instructions typing
export type Product = Database['public']['Tables']['products']['Row'] & {
  care_instructions: CareInstructions | Json | null
  category?: Database['public']['Tables']['categories']['Row'] | null
}