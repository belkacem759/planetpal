import { createServiceClient, supabase } from '@/lib/supabase/service';
import * as v from '@/lib/validation';
import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

const serviceSupabase = createServiceClient();

export type DbResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

// Database table types
type Tables = Database['public']['Tables'];
export type User = Tables['users']['Row'];
export type UserInsert = Tables['users']['Insert'];
export type UserUpdate = Tables['users']['Update'];
export type Category = Tables['categories']['Row'];
export type CategoryInsert = Tables['categories']['Insert'];
export type CategoryUpdate = Tables['categories']['Update'];
export type Product = Tables['products']['Row'];
export type ProductInsert = Tables['products']['Insert'];
export type ProductUpdate = Tables['products']['Update'];
export type Cart = Tables['cart']['Row'];
export type CartInsert = Tables['cart']['Insert'];
export type CartUpdate = Tables['cart']['Update'];
export type Order = Tables['orders']['Row'];
export type OrderInsert = Tables['orders']['Insert'];
export type OrderUpdate = Tables['orders']['Update'];
export type UserPlant = Tables['user_plants']['Row'];
export type UserPlantInsert = Tables['user_plants']['Insert'];
export type UserPlantUpdate = Tables['user_plants']['Update'];
export type Reminder = Tables['reminders']['Row'];
export type ReminderInsert = Tables['reminders']['Insert'];
export type ReminderUpdate = Tables['reminders']['Update'];

// Base CRUD operations
export class BaseService {
  protected client: SupabaseClient<Database>;

  constructor(protected tableName: string, useServiceRole: boolean = false) {
    this.client = useServiceRole ? serviceSupabase : supabase;
  }

  async findById<T = any>(id: string, userId?: string): Promise<DbResult<T>> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id);

      // Apply RLS for user-owned resources
      if (userId && ['user_plants', 'reminders', 'orders', 'cart'].includes(this.tableName)) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as T };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findMany<T = any>(filters?: Record<string, any>, userId?: string): Promise<DbResult<T[]>> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('*');

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply RLS for user-owned resources
      if (userId && ['user_plants', 'reminders', 'orders', 'cart'].includes(this.tableName)) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: (data || []) as T[] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findManyPaginated<T = any>(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>,
    userId?: string
  ): Promise<DbResult<{ data: T[]; count: number; page: number; totalPages: number }>> {
    try {
      const offset = (page - 1) * limit;

      let query = this.client.from(this.tableName).select('*', { count: 'exact' });

      // Apply RLS for user-owned resources
      if (userId && ['user_plants', 'reminders', 'orders', 'cart'].includes(this.tableName)) {
        query = query.eq('user_id', userId);
      }

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: {
          data: (data || []) as T[],
          count: count || 0,
          page,
          totalPages
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async create<T = any>(data: Record<string, any>, userId?: string): Promise<DbResult<T>> {
    try {
      // Add user_id for user-owned resources
      const insertData = { ...data };
      if (userId && ['user_plants', 'reminders', 'orders', 'cart'].includes(this.tableName)) {
        insertData.user_id = userId;
      }

      const { data: result, error } = await (this.client as any)
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result as T };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async update<T = any>(id: string, data: Record<string, any>, userId?: string): Promise<DbResult<T>> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      let query = (this.client as any)
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select();

      // Apply RLS for user-owned resources
      if (userId && ['user_plants', 'reminders', 'orders', 'cart'].includes(this.tableName)) {
        query = query.eq('user_id', userId);
      }

      const { data: result, error } = await query.single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result as T };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async delete<T = any>(id: string, userId?: string): Promise<DbResult<T[]>> {
    try {
      let query = (this.client as any)
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select();

      // Apply RLS for user-owned resources
      if (userId && ['user_plants', 'reminders', 'orders', 'cart'].includes(this.tableName)) {
        query = query.eq('user_id', userId);
      }

      const { data: result, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result as T[] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Specific service classes
export class UserService extends BaseService {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<DbResult<User>> {
    try {
      const { data, error } = await (this.client as any)
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as User };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updateProfile(userId: string, profileData: Record<string, any>): Promise<DbResult<User>> {
    const validation = v.validateData(v.UserUpdateSchema, profileData);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', ') || 'Validation failed' };
    }

    return this.update<User>(userId, validation.data || {});
  }
}

export class CategoryService extends BaseService {
  constructor() {
    super('categories');
  }

  async findBySlug(slug: string): Promise<DbResult<Category>> {
    try {
      const { data, error } = await (this.client as any)
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Category };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export class ProductService extends BaseService {
  constructor() {
    super('products');
  }

  async findByCategory(categoryId: string, filters?: Record<string, any>): Promise<DbResult<Product[]>> {
    const allFilters = { ...filters, category_id: categoryId };
    return this.findMany<Product>(allFilters);
  }

  async findBySlug(slug: string): Promise<DbResult<Product>> {
    try {
      const { data, error } = await (this.client as any)
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Product };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export class CartService extends BaseService {
  constructor(useServiceRole: boolean = true) {
    super('cart', useServiceRole);
  }

  async getUserCart(userId: string): Promise<DbResult<any[]>> {
    try {
      const { data, error } = await (this.client as any)
        .from(this.tableName)
        .select(`
          *,
          product:products(
            id,
            name,
            slug,
            price,
            images,
            stock_quantity
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<DbResult<Cart>> {
    try {
      // First, check if the product already exists in the user's cart
      const { data: existingItems, error: findError } = await (this.client as any)
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (findError) {
        return { success: false, error: findError.message };
      }

      // If item exists, update the quantity
      if (existingItems && existingItems.length > 0) {
        const existingItem = existingItems[0];
        const newQuantity = existingItem.quantity + quantity;
        
        const { data: updatedItem, error: updateError } = await (this.client as any)
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        return { success: true, data: updatedItem as Cart };
      }

      // If item doesn't exist, create a new cart item
      const cartData = {
        product_id: productId,
        quantity
      };

      const validation = v.validateData(v.CartInsertSchema, cartData);
      if (!validation.success) {
        return { success: false, error: validation.errors?.join(', ') || 'Validation failed' };
      }

      return this.create<Cart>(validation.data || {}, userId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updateQuantity(userId: string, cartId: string, quantity: number): Promise<DbResult<Cart>> {
    return this.update<Cart>(cartId, { quantity }, userId);
  }

  async removeFromCart(userId: string, cartId: string): Promise<DbResult<Cart[]>> {
    return this.delete<Cart>(cartId, userId);
  }
}

export class OrderService extends BaseService {
  constructor() {
    super('orders', true); // Use service role for bypassing RLS
  }

  async getUserOrders(userId: string): Promise<DbResult<Order[]>> {
    return this.findMany<Order>({}, userId);
  }

  async createOrder(userId: string, orderData: Record<string, any>): Promise<DbResult<Order>> {
    const validation = v.validateData(v.OrderInsertSchema, orderData);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', ') || 'Validation failed' };
    }

    return this.create<Order>(validation.data || {}, userId);
  }
}

export class UserPlantService extends BaseService {
  constructor() {
    super('user_plants');
  }

  async getUserPlants(userId: string): Promise<DbResult<UserPlant[]>> {
    return this.findMany<UserPlant>({}, userId);
  }

  async createUserPlant(userId: string, plantData: Record<string, any>): Promise<DbResult<UserPlant>> {
    const validation = v.validateData(v.UserPlantInsertSchema, plantData);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', ') || 'Validation failed' };
    }

    return this.create<UserPlant>(validation.data || {}, userId);
  }
}

export class ReminderService extends BaseService {
  constructor() {
    super('reminders');
  }

  async getUserReminders(userId: string): Promise<DbResult<Reminder[]>> {
    return this.findMany<Reminder>({}, userId);
  }

  async createReminder(userId: string, reminderData: Record<string, any>): Promise<DbResult<Reminder>> {
    const validation = v.validateData(v.ReminderInsertSchema, reminderData);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', ') || 'Validation failed' };
    }

    return this.create<Reminder>(validation.data || {}, userId);
  }

  async getUpcomingReminders(userId: string, days: number = 7): Promise<DbResult<Reminder[]>> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await (this.client as any)
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .lte('reminder_date', futureDate.toISOString())
        .order('reminder_date', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: (data || []) as Reminder[] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Export service instances
export const userService = new UserService();
export const categoryService = new CategoryService();
export const productService = new ProductService();
export const cartService = new CartService(); // Uses service role by default
export const orderService = new OrderService();
export const userPlantService = new UserPlantService();
export const reminderService = new ReminderService();

export { supabase };
