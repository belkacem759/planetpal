export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          addresses: Json | null
          created_at: string | null
          updated_at: string | null
          role: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          addresses?: Json | null
          created_at?: string | null
          updated_at?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          addresses?: Json | null
          created_at?: string | null
          updated_at?: string | null
          role?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          price: number
          stock_quantity: number
          images: Json | null
          care_instructions: Json | null
          difficulty_level: string | null
          is_plant: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          price: number
          stock_quantity?: number
          images?: Json | null
          care_instructions?: Json | null
          difficulty_level?: string | null
          is_plant?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          price?: number
          stock_quantity?: number
          images?: Json | null
          care_instructions?: Json | null
          difficulty_level?: string | null
          is_plant?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      cart: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          quantity: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          quantity?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          quantity?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          total_amount: number
          status: string | null
          shipping_address: Json | null
          payment_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          total_amount: number
          status?: string | null
          shipping_address?: Json | null
          payment_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          total_amount?: number
          status?: string | null
          shipping_address?: Json | null
          payment_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          price_at_purchase: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          price_at_purchase: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          price_at_purchase?: number
          created_at?: string | null
        }
      }
      user_plants: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          custom_name: string | null
          plant_type: string | null
          acquisition_date: string | null
          location: string | null
          notes: string | null
          image_url: string | null
          is_from_purchase: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          custom_name?: string | null
          plant_type?: string | null
          acquisition_date?: string | null
          location?: string | null
          notes?: string | null
          image_url?: string | null
          is_from_purchase?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          custom_name?: string | null
          plant_type?: string | null
          acquisition_date?: string | null
          location?: string | null
          notes?: string | null
          image_url?: string | null
          is_from_purchase?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      care_schedules: {
        Row: {
          id: string
          user_plant_id: string | null
          care_type: string | null
          frequency_days: number
          last_completed_at: string | null
          next_due_at: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_plant_id?: string | null
          care_type?: string | null
          frequency_days: number
          last_completed_at?: string | null
          next_due_at?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_plant_id?: string | null
          care_type?: string | null
          frequency_days?: number
          last_completed_at?: string | null
          next_due_at?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      care_logs: {
        Row: {
          id: string
          user_plant_id: string | null
          care_schedule_id: string | null
          care_type: string | null
          completed_at: string
          notes: string | null
          photos: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_plant_id?: string | null
          care_schedule_id?: string | null
          care_type?: string | null
          completed_at: string
          notes?: string | null
          photos?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_plant_id?: string | null
          care_schedule_id?: string | null
          care_type?: string | null
          completed_at?: string
          notes?: string | null
          photos?: Json | null
          created_at?: string | null
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string | null
          user_plant_id: string | null
          care_schedule_id: string | null
          reminder_type: string | null
          scheduled_for: string | null
          is_sent: boolean | null
          is_completed: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_plant_id?: string | null
          care_schedule_id?: string | null
          reminder_type?: string | null
          scheduled_for?: string | null
          is_sent?: boolean | null
          is_completed?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          user_plant_id?: string | null
          care_schedule_id?: string | null
          reminder_type?: string | null
          scheduled_for?: string | null
          is_sent?: boolean | null
          is_completed?: boolean | null
          created_at?: string | null
        }
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

// Care Instructions Types
export interface CareInstructionItem {
  text: string
  difficulty: number // 1-5 scale
}

export interface PlantCareInstructions {
  light: CareInstructionItem
  water: CareInstructionItem
  humidity: CareInstructionItem
  fertilizer: CareInstructionItem
  temperature: CareInstructionItem
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