import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Validate session from cookies
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Try to get additional profile data from public.users (if exists)
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, created_at, updated_at, role')
      .eq('id', user.id)
      .single();

    // Derive first/last name from full_name when possible
    let first_name: string | undefined;
    let last_name: string | undefined;
    const fullName = profile?.full_name || (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name));
    if (typeof fullName === 'string' && fullName.trim().length > 0) {
      const parts = fullName.trim().split(/\s+/);
      first_name = parts[0];
      if (parts.length > 1) {
        last_name = parts.slice(1).join(' ');
      }
    } else {
      // Check individual fields in user_metadata
      if (typeof user.user_metadata?.first_name === 'string') first_name = user.user_metadata.first_name;
      if (typeof user.user_metadata?.last_name === 'string') last_name = user.user_metadata.last_name;
    }

    const responsePayload = {
      id: user.id,
      email: user.email ?? profile?.email ?? '',
      first_name,
      last_name,
      phone: (user as any).phone ?? undefined,
      avatar_url: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? undefined,
      email_verified: Boolean((user as any).email_confirmed_at),
      created_at: profile?.created_at ?? user.created_at,
      updated_at: profile?.updated_at ?? user.updated_at,
      role: profile?.role,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (err) {
    console.error('GET /api/auth/me failed:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}