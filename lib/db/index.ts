import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import * as v from '@/lib/validation';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

export type DbResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

// Base CRUD operations
export class BaseService {
  constructor(protected tableName: string) {}

  async findById(id: string, userId?: string): Promise<DbResult<any>> {
    try {
      let query = (supabase as any)
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

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findMany(filters?: Record<string, any>, userId?: string): Promise<DbResult<any[]>> {
    try {
      let query = (supabase as any)
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

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findManyPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>,
    userId?: string
  ): Promise<DbResult<{ data: any[]; count: number; page: number; totalPages: number }>> {
    try {
      const offset = (page - 1) * limit;

      let query = (supabase as any).from(this.tableName).select('*', { count: 'exact' });

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
          data: data || [],
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

  async create(data: any, userId?: string): Promise<DbResult<any>> {
    try {
      // Add user_id for user-owned resources
      const insertData = { ...data };
      if (userId && ['user_plants', 'reminders', 'orders', 'cart'].includes(this.tableName)) {
        insertData.user_id = userId;
      }

      const { data: result, error } = await (supabase as any)
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async update(id: string, data: any, userId?: string): Promise<DbResult<any>> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      let query = (supabase as any)
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

      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async delete(id: string, userId?: string): Promise<DbResult<boolean>> {
    try {
      let query = (supabase as any)
        .from(this.tableName)
        .delete()
        .eq('id', id);

      // Apply RLS for user-owned resources
      if (userId && ['user_plants', 'reminders', 'orders', 'cart'].includes(this.tableName)) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: true };
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

  async findByEmail(email: string): Promise<DbResult<any>> {
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updateProfile(userId: string, profileData: any): Promise<DbResult<any>> {
    const validation = v.validateData(v.UserUpdateSchema, profileData);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', ') || 'Validation failed' };
    }

    return this.update(userId, validation.data);
  }
}

export class CategoryService extends BaseService {
  constructor() {
    super('categories');
  }

  async findBySlug(slug: string): Promise<DbResult<any>> {
    try {
      const { data, error } = await (supabase as any)
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
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

  async findByCategory(categoryId: string, filters?: any): Promise<DbResult<any[]>> {
    const allFilters = { ...filters, category_id: categoryId };
    return this.findMany(allFilters);
  }

  async findBySlug(slug: string): Promise<DbResult<any>> {
    try {
      const { data, error } = await (supabase as any)
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export class CartService extends BaseService {
  constructor() {
    super('cart');
  }

  async getUserCart(userId: string): Promise<DbResult<any[]>> {
    return this.findMany({}, userId);
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<DbResult<any>> {
    const cartData = {
      product_id: productId,
      quantity
    };

    const validation = v.validateData(v.CartInsertSchema, cartData);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', ') || 'Validation failed' };
    }

    return this.create(validation.data, userId);
  }

  async updateQuantity(userId: string, cartId: string, quantity: number): Promise<DbResult<any>> {
    return this.update(cartId, { quantity }, userId);
  }

  async removeFromCart(userId: string, cartId: string): Promise<DbResult<boolean>> {
    return this.delete(cartId, userId);
  }
}

export class OrderService extends BaseService {
  constructor() {
    super('orders');
  }

  async getUserOrders(userId: string): Promise<DbResult<any[]>> {
    return this.findMany({}, userId);
  }

  async createOrder(userId: string, orderData: any): Promise<DbResult<any>> {
    const validation = v.validateData(v.OrderInsertSchema, orderData);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', ') || 'Validation failed' };
    }

    return this.create(validation.data, userId);
  }
}

export class UserPlantService extends BaseService {
  constructor() {
    super('user_plants');
  }

  async getUserPlants(userId: string): Promise<DbResult<any[]>> {
    return this.findMany({}, userId);
  }

  async addPlant(userId: string, plantData: any): Promise<DbResult<any>> {
    const validation = v.validateData(v.UserPlantInsertSchema, plantData);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', ') || 'Validation failed' };
    }

    return this.create(validation.data, userId);
  }
}

export class ReminderService extends BaseService {
  constructor() {
    super('reminders');
  }

  async getUserReminders(userId: string): Promise<DbResult<any[]>> {
    return this.findMany({}, userId);
  }

  async createReminder(userId: string, reminderData: any): Promise<DbResult<any>> {
    const validation = v.validateData(v.ReminderInsertSchema, reminderData);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', ') || 'Validation failed' };
    }

    return this.create(validation.data, userId);
  }

  async getUpcomingReminders(userId: string, days: number = 7): Promise<DbResult<any[]>> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await (supabase as any)
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .lte('reminder_date', futureDate.toISOString())
        .order('reminder_date', { ascending: true });

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
}

// Export service instances
export const userService = new UserService();
export const categoryService = new CategoryService();
export const productService = new ProductService();
export const cartService = new CartService();
export const orderService = new OrderService();
export const userPlantService = new UserPlantService();
export const reminderService = new ReminderService();

export { supabase };