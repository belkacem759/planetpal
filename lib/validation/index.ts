import * as v from 'valibot';

// Base schemas
export const UuidSchema = v.pipe(v.string(), v.uuid());
export const EmailSchema = v.pipe(v.string(), v.email());
export const SlugSchema = v.pipe(v.string(), v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
export const TimestampSchema = v.pipe(v.string(), v.isoTimestamp());
export const DateSchema = v.pipe(v.string(), v.isoDate());

// User schemas
export const UserInsertSchema = v.object({
  id: v.optional(UuidSchema),
  email: EmailSchema,
  full_name: v.optional(v.nullable(v.string())),
  avatar_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
  role: v.optional(v.nullable(v.picklist(['user', 'admin']))),
});

export const UserUpdateSchema = v.object({
  email: v.optional(EmailSchema),
  full_name: v.optional(v.nullable(v.string())),
  avatar_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
  role: v.optional(v.nullable(v.picklist(['user', 'admin']))),
});

// Category schemas
export const CategoryInsertSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  slug: SlugSchema,
  description: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(500)))),
  image_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
});

export const CategoryUpdateSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
  slug: v.optional(SlugSchema),
  description: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(500)))),
  image_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
});

// Care Instructions schemas
export const CareInstructionItemSchema = v.object({
  text: v.pipe(v.string(), v.minLength(1)),
  difficulty: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5)),
});

export const PlantCareInstructionsSchema = v.object({
  light: CareInstructionItemSchema,
  water: CareInstructionItemSchema,
  humidity: CareInstructionItemSchema,
  fertilizer: CareInstructionItemSchema,
  temperature: CareInstructionItemSchema,
});

export const ProductCareInstructionsSchema = v.record(v.string(), CareInstructionItemSchema);

export const CareInstructionsSchema = v.union([
  PlantCareInstructionsSchema,
  ProductCareInstructionsSchema,
]);

// Product schemas
export const ProductInsertSchema = v.object({
  category_id: v.optional(v.nullable(UuidSchema)),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  slug: SlugSchema,
  description: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(2000)))),
  price: v.pipe(v.number(), v.minValue(0)),
  stock_quantity: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  images: v.optional(v.nullable(v.array(v.pipe(v.string(), v.url())))),
  care_instructions: v.optional(v.nullable(CareInstructionsSchema)),
  difficulty_level: v.optional(v.nullable(v.picklist(['beginner', 'intermediate', 'advanced']))),
  is_plant: v.optional(v.nullable(v.boolean())),
});

export const ProductUpdateSchema = v.object({
  category_id: v.optional(v.nullable(UuidSchema)),
  name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
  slug: v.optional(SlugSchema),
  description: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(2000)))),
  price: v.optional(v.pipe(v.number(), v.minValue(0))),
  stock_quantity: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  images: v.optional(v.nullable(v.array(v.pipe(v.string(), v.url())))),
  care_instructions: v.optional(v.nullable(CareInstructionsSchema)),
  difficulty_level: v.optional(v.nullable(v.picklist(['beginner', 'intermediate', 'advanced']))),
  is_plant: v.optional(v.nullable(v.boolean())),
});

// Cart schemas
export const CartInsertSchema = v.object({
  user_id: v.optional(v.nullable(UuidSchema)),
  product_id: v.optional(v.nullable(UuidSchema)),
  quantity: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
});

export const CartUpdateSchema = v.object({
  quantity: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
});

// Order schemas
export const OrderInsertSchema = v.object({
  user_id: v.optional(v.nullable(UuidSchema)),
  total_amount: v.pipe(v.number(), v.minValue(0)),
  status: v.optional(v.nullable(v.picklist(['pending', 'processing', 'shipped', 'delivered', 'cancelled']))),
  shipping_address: v.optional(v.nullable(v.object({
    street: v.string(),
    city: v.string(),
    state: v.string(),
    postal_code: v.string(),
    country: v.string(),
  }))),
  payment_status: v.optional(v.nullable(v.picklist(['pending', 'paid', 'failed']))),
});

export const OrderUpdateSchema = v.object({
  status: v.optional(v.nullable(v.picklist(['pending', 'processing', 'shipped', 'delivered', 'cancelled']))),
  shipping_address: v.optional(v.nullable(v.object({
    street: v.string(),
    city: v.string(),
    state: v.string(),
    postal_code: v.string(),
    country: v.string(),
  }))),
  payment_status: v.optional(v.nullable(v.picklist(['pending', 'paid', 'failed']))),
});

// Order Item schemas
export const OrderItemInsertSchema = v.object({
  order_id: v.optional(v.nullable(UuidSchema)),
  product_id: v.optional(v.nullable(UuidSchema)),
  quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
  price_at_purchase: v.pipe(v.number(), v.minValue(0)),
});

// User Plant schemas
export const UserPlantInsertSchema = v.object({
  user_id: v.optional(v.nullable(UuidSchema)),
  product_id: v.optional(v.nullable(UuidSchema)),
  custom_name: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  plant_type: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  acquisition_date: v.optional(v.nullable(DateSchema)),
  location: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  notes: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(1000)))),
  image_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
  is_from_purchase: v.optional(v.nullable(v.boolean())),
});

export const UserPlantUpdateSchema = v.object({
  custom_name: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  plant_type: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  acquisition_date: v.optional(v.nullable(DateSchema)),
  location: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  notes: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(1000)))),
  image_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
  is_from_purchase: v.optional(v.nullable(v.boolean())),
});

// Care Schedule schemas
export const CareScheduleInsertSchema = v.object({
  user_plant_id: v.optional(v.nullable(UuidSchema)),
  care_type: v.optional(v.nullable(v.picklist(['watering', 'fertilizing', 'pruning', 'repotting']))),
  frequency_days: v.pipe(v.number(), v.integer(), v.minValue(1)),
  last_completed_at: v.optional(v.nullable(TimestampSchema)),
  next_due_at: v.optional(v.nullable(TimestampSchema)),
  is_active: v.optional(v.nullable(v.boolean())),
});

export const CareScheduleUpdateSchema = v.object({
  care_type: v.optional(v.nullable(v.picklist(['watering', 'fertilizing', 'pruning', 'repotting']))),
  frequency_days: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  last_completed_at: v.optional(v.nullable(TimestampSchema)),
  next_due_at: v.optional(v.nullable(TimestampSchema)),
  is_active: v.optional(v.nullable(v.boolean())),
});

// Care Log schemas
export const CareLogInsertSchema = v.object({
  user_plant_id: v.optional(v.nullable(UuidSchema)),
  care_schedule_id: v.optional(v.nullable(UuidSchema)),
  care_type: v.optional(v.nullable(v.string())),
  completed_at: TimestampSchema,
  notes: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(1000)))),
  photos: v.optional(v.nullable(v.array(v.pipe(v.string(), v.url())))),
});

export const CareLogUpdateSchema = v.object({
  care_type: v.optional(v.nullable(v.string())),
  completed_at: v.optional(TimestampSchema),
  notes: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(1000)))),
  photos: v.optional(v.nullable(v.array(v.pipe(v.string(), v.url())))),
});

// Reminder schemas
export const ReminderInsertSchema = v.object({
  user_id: v.optional(v.nullable(UuidSchema)),
  user_plant_id: v.optional(v.nullable(UuidSchema)),
  care_schedule_id: v.optional(v.nullable(UuidSchema)),
  reminder_type: v.optional(v.nullable(v.string())),
  scheduled_for: v.optional(v.nullable(TimestampSchema)),
  is_sent: v.optional(v.nullable(v.boolean())),
  is_completed: v.optional(v.nullable(v.boolean())),
});

export const ReminderUpdateSchema = v.object({
  reminder_type: v.optional(v.nullable(v.string())),
  scheduled_for: v.optional(v.nullable(TimestampSchema)),
  is_sent: v.optional(v.nullable(v.boolean())),
  is_completed: v.optional(v.nullable(v.boolean())),
});

// Address schemas
export const AddressSchema = v.object({
  type: v.picklist(['shipping', 'billing']),
  is_default: v.optional(v.boolean(), false),
  first_name: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
  last_name: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
  company: v.optional(v.pipe(v.string(), v.maxLength(100))),
  address_line_1: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  address_line_2: v.optional(v.pipe(v.string(), v.maxLength(255))),
  city: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  state: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  postal_code: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
  country: v.pipe(v.string(), v.minLength(2), v.maxLength(2)), // ISO country code
  phone: v.optional(v.pipe(v.string(), v.maxLength(20))),
});

export const AddressInsertSchema = AddressSchema;
export const AddressUpdateSchema = v.partial(AddressSchema);

// Change password schema
export const ChangePasswordSchema = v.object({
  current_password: v.pipe(v.string(), v.minLength(1)),
  new_password: v.pipe(v.string(), v.minLength(8), v.maxLength(128)),
  confirm_password: v.pipe(v.string(), v.minLength(1)),
});

// Query parameter schemas
export const PaginationSchema = v.object({
  page: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1)), '1'),
  limit: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(100)), '10'),
});

export const SortSchema = v.object({
  sort_by: v.optional(v.string()),
  sort_order: v.optional(v.picklist(['asc', 'desc']), 'asc'),
});

export const FilterSchema = v.object({
  search: v.optional(v.string()),
  category_id: v.optional(UuidSchema),
  is_plant: v.optional(v.pipe(v.string(), v.transform(val => val === 'true'))),
  difficulty_level: v.optional(v.picklist(['beginner', 'intermediate', 'advanced'])),
  status: v.optional(v.string()),
});

// Validation helper function
export function validateData<T>(schema: v.BaseSchema<unknown, T, v.BaseIssue<unknown>>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = v.parse(schema, data);
    return { success: true, data: result };
  } catch (error) {
    if (v.isValiError(error)) {
      const errors = error.issues.map(issue => {
        const path = issue.path?.map(p => p.key).join('.') || 'root';
        return `${path}: ${issue.message}`;
      });
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Export types
export type UserInsert = v.InferInput<typeof UserInsertSchema>;
export type UserUpdate = v.InferInput<typeof UserUpdateSchema>;
export type CategoryInsert = v.InferInput<typeof CategoryInsertSchema>;
export type CategoryUpdate = v.InferInput<typeof CategoryUpdateSchema>;
export type ProductInsert = v.InferInput<typeof ProductInsertSchema>;
export type ProductUpdate = v.InferInput<typeof ProductUpdateSchema>;
export type CartInsert = v.InferInput<typeof CartInsertSchema>;
export type CartUpdate = v.InferInput<typeof CartUpdateSchema>;
export type OrderInsert = v.InferInput<typeof OrderInsertSchema>;
export type OrderUpdate = v.InferInput<typeof OrderUpdateSchema>;
export type OrderItemInsert = v.InferInput<typeof OrderItemInsertSchema>;
export type UserPlantInsert = v.InferInput<typeof UserPlantInsertSchema>;
export type UserPlantUpdate = v.InferInput<typeof UserPlantUpdateSchema>;
export type CareScheduleInsert = v.InferInput<typeof CareScheduleInsertSchema>;
export type CareScheduleUpdate = v.InferInput<typeof CareScheduleUpdateSchema>;
export type CareLogInsert = v.InferInput<typeof CareLogInsertSchema>;
export type CareLogUpdate = v.InferInput<typeof CareLogUpdateSchema>;
export type ReminderInsert = v.InferInput<typeof ReminderInsertSchema>;
export type ReminderUpdate = v.InferInput<typeof ReminderUpdateSchema>;
export type Pagination = v.InferInput<typeof PaginationSchema>;
export type Sort = v.InferInput<typeof SortSchema>;
export type Filter = v.InferInput<typeof FilterSchema>;