import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Regular Supabase client (anon key)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Please add it to your environment variables.'
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set. Please add it to your environment variables.'
    );
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}