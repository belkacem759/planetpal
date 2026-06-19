import { createServiceClient, supabase } from '@/lib/supabase/service';
import { validateData, UserUpdateSchema, CartInsertSchema, OrderInsertSchema, UserPlantInsertSchema, ReminderInsertSchema } from '@/lib/validation';
import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

// Lazily create the service-role client so importing this module (and the
// services instantiated below) never throws at build/load time when env vars
// are absent. The client is only needed at request time.
let serviceSupabaseInstance: SupabaseClient<Database> | null = null;

const serviceSupabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    if (!serviceSupabaseInstance) {
      serviceSupabaseInstance = createServiceClient();
    }
    const value = Reflect.get(serviceSupabaseInstance, prop, receiver);
    return typeof value === 'function' ? value.bind(serviceSupabaseInstance) : value;
  },
});

export type DbResult<T> = {
  data: T;
  success: true;
} | {
  error: string;
  success: false;
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
export type OrderItem = Tables['order_items']['Row'];
export type OrderItemInsert = Tables['order_items']['Insert'];
export type OrderItemUpdate = Tables['order_items']['Update'];
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
        return { error: error.message, success: false };
      }

      return { data: data as T, success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
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
        return { error: error.message, success: false };
      }

      return { data: (data || []) as T[], success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  async findManyPaginated<T = any>(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>,
    userId?: string
  ): Promise<DbResult<{ count: number; data: T[]; page: number; totalPages: number }>> {
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

      const { count, data, error } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        return { error: error.message, success: false };
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: {
          count: count || 0,
          data: (data || []) as T[],
          page,
          totalPages
        },
        success: true
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
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
        return { error: error.message, success: false };
      }

      return { data: result as T, success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
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
        return { error: error.message, success: false };
      }

      return { data: result as T, success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
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
        return { error: error.message, success: false };
      }

      return { data: result as T[], success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
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
        return { error: error.message, success: false };
      }

      return { data: data as User, success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  async updateProfile(userId: string, profileData: Record<string, any>): Promise<DbResult<User>> {
    const validation = validateData(UserUpdateSchema, profileData);
    if (!validation.success) {
      return { error: validation.errors?.join(', ') || 'Validation failed', success: false };
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
        return { error: error.message, success: false };
      }

      return { data: data as Category, success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
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
        .select('*, ...categories!inner(category_name:name)')
        .eq('slug', slug)
        .single();

      if (error) {
        return { error: error.message, success: false };
      }

      return { data: data as Product, success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
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
        return { error: error.message, success: false };
      }

      return { data: data || [], success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
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
        return { error: findError.message, success: false };
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
          return { error: updateError.message, success: false };
        }

        return { data: updatedItem as Cart, success: true };
      }

      // If item doesn't exist, create a new cart item
      const cartData = {
        product_id: productId,
        quantity
      };

      const validation = validateData(CartInsertSchema, cartData);
      if (!validation.success) {
        return { error: validation.errors?.join(', ') || 'Validation failed', success: false };
      }

      return this.create<Cart>(validation.data || {}, userId);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  async updateQuantity(userId: string, cartId: string, quantity: number): Promise<DbResult<Cart>> {
    return this.update<Cart>(cartId, { quantity }, userId);
  }

  async removeFromCart(userId: string, cartId: string): Promise<DbResult<Cart[]>> {
    return this.delete<Cart>(cartId, userId);
  }

  async clearCart(userId: string): Promise<DbResult<any>> {
    try {
      const { error } = await (this.client as any)
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);

      if (error) {
        return { error: error.message, success: false };
      }

      return { data: { cleared: true }, success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
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
    const validation = validateData(OrderInsertSchema, orderData);
    if (!validation.success) {
      return { error: validation.errors?.join(', ') || 'Validation failed', success: false };
    }

    return this.create<Order>(validation.data || {}, userId);
  }
}

export class OrderItemService extends BaseService {
  constructor() {
    super('order_items', true); // Use service role for bypassing RLS
  }

  async createOrderItems(orderItems: OrderItemInsert[]): Promise<DbResult<OrderItem[]>> {
    try {
      const { data, error } = await (this.client as any)
        .from(this.tableName)
        .insert(orderItems)
        .select();

      if (error) {
        return { error: error.message, success: false };
      }

      return { data: data as OrderItem[], success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  async getOrderItems(orderId: string): Promise<DbResult<OrderItem[]>> {
    try {
      const { data, error } = await (this.client as any)
        .from(this.tableName)
        .select(`
          *,
          product:products(
            id,
            name,
            slug,
            images
          )
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        return { error: error.message, success: false };
      }

      return { data: data || [], success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
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
    const validation = validateData(UserPlantInsertSchema, plantData);
    if (!validation.success) {
      return { error: validation.errors?.join(', ') || 'Validation failed', success: false };
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
    const validation = validateData(ReminderInsertSchema, reminderData);
    if (!validation.success) {
      return { error: validation.errors?.join(', ') || 'Validation failed', success: false };
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
        return { error: error.message, success: false };
      }

      return { data: (data || []) as Reminder[], success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
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
export const orderItemService = new OrderItemService();
export const userPlantService = new UserPlantService();
export const reminderService = new ReminderService();

export { supabase };
