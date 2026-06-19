import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Lazily create the anon Supabase client so importing this module never throws
// at build/load time when env vars are absent. The client is only needed at
// request time; property access initializes the real client on first use.
let supabaseInstance: SupabaseClient<Database> | null = null;

function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
    );
  }
  return supabaseInstance;
}

// Regular Supabase client (anon key)
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const instance = getSupabase();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

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