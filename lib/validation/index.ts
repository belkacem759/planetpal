import * as v from 'valibot';

// Base schemas
export const UuidSchema = v.pipe(v.string(), v.uuid());
export const EmailSchema = v.pipe(v.string(), v.email());
export const SlugSchema = v.pipe(v.string(), v.regex(/^[\da-z]+(?:-[\da-z]+)*$/));
export const TimestampSchema = v.pipe(v.string(), v.isoTimestamp());
export const DateSchema = v.pipe(v.string(), v.isoDate());

// User schemas
export const UserInsertSchema = v.object({
  avatar_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
  email: EmailSchema,
  full_name: v.optional(v.nullable(v.string())),
  id: v.optional(UuidSchema),
  role: v.optional(v.nullable(v.picklist(['user', 'admin']))),
});

export const UserUpdateSchema = v.object({
  avatar_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
  email: v.optional(EmailSchema),
  full_name: v.optional(v.nullable(v.string())),
  role: v.optional(v.nullable(v.picklist(['user', 'admin']))),
});

// Category schemas
export const CategoryInsertSchema = v.object({
  description: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(500)))),
  image_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  slug: SlugSchema,
});

export const CategoryUpdateSchema = v.object({
  description: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(500)))),
  image_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
  name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
  slug: v.optional(SlugSchema),
});

// Care Instructions schemas
export const CareInstructionItemSchema = v.object({
  difficulty: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5)),
  text: v.pipe(v.string(), v.minLength(1)),
});

export const PlantCareInstructionsSchema = v.object({
  fertilizer: CareInstructionItemSchema,
  humidity: CareInstructionItemSchema,
  light: CareInstructionItemSchema,
  temperature: CareInstructionItemSchema,
  water: CareInstructionItemSchema,
});

export const ProductCareInstructionsSchema = v.record(v.string(), CareInstructionItemSchema);

export const CareInstructionsSchema = v.union([
  PlantCareInstructionsSchema,
  ProductCareInstructionsSchema,
]);

// Product schemas
export const ProductInsertSchema = v.object({
  care_instructions: v.optional(v.nullable(CareInstructionsSchema)),
  category_id: v.optional(v.nullable(UuidSchema)),
  description: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(2000)))),
  difficulty_level: v.optional(v.nullable(v.picklist(['beginner', 'intermediate', 'advanced']))),
  images: v.optional(v.nullable(v.array(v.pipe(v.string(), v.url())))),
  is_plant: v.optional(v.nullable(v.boolean())),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  price: v.pipe(v.number(), v.minValue(0)),
  slug: SlugSchema,
  stock_quantity: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
});

export const ProductUpdateSchema = v.object({
  care_instructions: v.optional(v.nullable(CareInstructionsSchema)),
  category_id: v.optional(v.nullable(UuidSchema)),
  description: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(2000)))),
  difficulty_level: v.optional(v.nullable(v.picklist(['beginner', 'intermediate', 'advanced']))),
  images: v.optional(v.nullable(v.array(v.pipe(v.string(), v.url())))),
  is_plant: v.optional(v.nullable(v.boolean())),
  name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
  price: v.optional(v.pipe(v.number(), v.minValue(0))),
  slug: v.optional(SlugSchema),
  stock_quantity: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
});

// Cart schemas
export const CartInsertSchema = v.object({
  product_id: v.optional(v.nullable(UuidSchema)),
  quantity: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  user_id: v.optional(v.nullable(UuidSchema)),
});

export const CartUpdateSchema = v.object({
  quantity: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
});

// Order schemas
export const OrderInsertSchema = v.object({
  payment_status: v.optional(v.nullable(v.picklist(['pending', 'paid', 'failed']))),
  shipping_address: v.optional(v.nullable(v.object({
    city: v.string(),
    country: v.string(),
    postal_code: v.string(),
    state: v.string(),
    street: v.string(),
  }))),
  status: v.optional(v.nullable(v.picklist(['pending', 'processing', 'shipped', 'delivered', 'cancelled']))),
  total_amount: v.pipe(v.number(), v.minValue(0)),
  user_id: v.optional(v.nullable(UuidSchema)),
});

export const OrderUpdateSchema = v.object({
  payment_status: v.optional(v.nullable(v.picklist(['pending', 'paid', 'failed']))),
  shipping_address: v.optional(v.nullable(v.object({
    address_line_1: v.string(),
    address_line_2: v.optional(v.string()),
    city: v.string(),
    country: v.string(),
    first_name: v.string(),
    last_name: v.string(),
    phone: v.optional(v.string()),
    postal_code: v.string(),
    state: v.string(),
  }))),
  status: v.optional(v.nullable(v.picklist(['pending', 'processing', 'shipped', 'delivered', 'cancelled']))),
});

// Order Item schemas
export const OrderItemInsertSchema = v.object({
  order_id: v.optional(v.nullable(UuidSchema)),
  price_at_purchase: v.pipe(v.number(), v.minValue(0)),
  product_id: v.optional(v.nullable(UuidSchema)),
  quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

// User Plant schemas
export const UserPlantInsertSchema = v.object({
  acquisition_date: v.optional(v.nullable(DateSchema)),
  custom_name: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  image_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
  is_from_purchase: v.optional(v.nullable(v.boolean())),
  location: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  notes: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(1000)))),
  plant_type: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  product_id: v.optional(v.nullable(UuidSchema)),
  user_id: v.optional(v.nullable(UuidSchema)),
});

export const UserPlantUpdateSchema = v.object({
  acquisition_date: v.optional(v.nullable(DateSchema)),
  custom_name: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  image_url: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
  is_from_purchase: v.optional(v.nullable(v.boolean())),
  location: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
  notes: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(1000)))),
  plant_type: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(100)))),
});

// Care Schedule schemas
export const CareScheduleInsertSchema = v.object({
  care_type: v.optional(v.nullable(v.picklist(['watering', 'fertilizing', 'pruning', 'repotting']))),
  frequency_days: v.pipe(v.number(), v.integer(), v.minValue(1)),
  is_active: v.optional(v.nullable(v.boolean())),
  last_completed_at: v.optional(v.nullable(TimestampSchema)),
  next_due_at: v.optional(v.nullable(TimestampSchema)),
  user_plant_id: v.optional(v.nullable(UuidSchema)),
});

export const CareScheduleUpdateSchema = v.object({
  care_type: v.optional(v.nullable(v.picklist(['watering', 'fertilizing', 'pruning', 'repotting']))),
  frequency_days: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  is_active: v.optional(v.nullable(v.boolean())),
  last_completed_at: v.optional(v.nullable(TimestampSchema)),
  next_due_at: v.optional(v.nullable(TimestampSchema)),
});

// Care Log schemas
export const CareLogInsertSchema = v.object({
  care_schedule_id: v.optional(v.nullable(UuidSchema)),
  care_type: v.optional(v.nullable(v.string())),
  completed_at: TimestampSchema,
  notes: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(1000)))),
  photos: v.optional(v.nullable(v.array(v.pipe(v.string(), v.url())))),
  user_plant_id: v.optional(v.nullable(UuidSchema)),
});

export const CareLogUpdateSchema = v.object({
  care_type: v.optional(v.nullable(v.string())),
  completed_at: v.optional(TimestampSchema),
  notes: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(1000)))),
  photos: v.optional(v.nullable(v.array(v.pipe(v.string(), v.url())))),
});

// Reminder schemas
export const ReminderInsertSchema = v.object({
  care_schedule_id: v.optional(v.nullable(UuidSchema)),
  is_completed: v.optional(v.nullable(v.boolean())),
  is_sent: v.optional(v.nullable(v.boolean())),
  reminder_type: v.optional(v.nullable(v.string())),
  scheduled_for: v.optional(v.nullable(TimestampSchema)),
  user_id: v.optional(v.nullable(UuidSchema)),
  user_plant_id: v.optional(v.nullable(UuidSchema)),
});

export const ReminderUpdateSchema = v.object({
  is_completed: v.optional(v.nullable(v.boolean())),
  is_sent: v.optional(v.nullable(v.boolean())),
  reminder_type: v.optional(v.nullable(v.string())),
  scheduled_for: v.optional(v.nullable(TimestampSchema)),
});

// Address schemas
export const AddressSchema = v.object({
  address_line_1: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  address_line_2: v.optional(v.pipe(v.string(), v.maxLength(255))),
  city: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  company: v.optional(v.pipe(v.string(), v.maxLength(100))),
  country: v.pipe(v.string(), v.minLength(2), v.maxLength(2)), // ISO country code
  first_name: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
  is_default: v.optional(v.boolean(), false),
  last_name: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
  phone: v.optional(v.pipe(v.string(), v.maxLength(20))),
  postal_code: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
  state: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  type: v.picklist(['shipping', 'billing']),
});

export const AddressInsertSchema = AddressSchema;
export const AddressUpdateSchema = v.partial(AddressSchema);

// Change password schema
export const ChangePasswordSchema = v.object({
  confirm_password: v.pipe(v.string(), v.minLength(1)),
  current_password: v.pipe(v.string(), v.minLength(1)),
  new_password: v.pipe(v.string(), v.minLength(8), v.maxLength(128)),
});

// Query parameter schemas
export const PaginationSchema = v.object({
  limit: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(100)), '10'),
  page: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1)), '1'),
});

export const SortSchema = v.object({
  sort_by: v.optional(v.string()),
  sort_order: v.optional(v.picklist(['asc', 'desc']), 'asc'),
});

export const FilterSchema = v.object({
  category_id: v.optional(UuidSchema),
  difficulty_level: v.optional(v.picklist(['beginner', 'intermediate', 'advanced'])),
  is_plant: v.optional(v.pipe(v.string(), v.transform(val => val === 'true'))),
  search: v.optional(v.string()),
  status: v.optional(v.string()),
});

// Validation helper function
export function validateData<T>(schema: v.BaseSchema<unknown, T, v.BaseIssue<unknown>>, data: unknown):
  | { data: T; errors?: undefined; success: true; }
  | { data?: undefined; errors: string[]; success: false; } {
  try {
    const result = v.parse(schema, data);
    return { data: result, success: true };
  } catch (error) {
    if (v.isValiError(error)) {
      const errors = error.issues.map(issue => {
        const path = issue.path?.map(p => p.key).join('.') || 'root';
        return `${path}: ${issue.message}`;
      });
      return { errors, success: false };
    }
    return { errors: ['Validation failed'], success: false };
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