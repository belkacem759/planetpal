import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './rate-limit';
import { Database } from '@/types/database';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Rate limiting middleware
export async function withRateLimit(
  request: NextRequest,
  identifier?: string
): Promise<NextResponse | null> {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'anonymous';
  const key = identifier || ip;
  
  const { success, limit, remaining, reset } = await rateLimit(key);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }
  
  return null;
}

// Authentication middleware
export async function withAuth(
  request: NextRequest
): Promise<{ user: any; error?: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    };
  }
  
  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      };
    }
    
    // Get user profile with role
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single();
    
    return {
      user: profile || { id: user.id, email: user.email, role: 'user' }
    };
  } catch (error) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    };
  }
}

// Admin role check middleware
export function withAdminRole(user: any): NextResponse | null {
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  return null;
}

// Resource ownership check middleware
export async function withOwnership(
  user: any,
  resourceType: string,
  resourceId: string
): Promise<NextResponse | null> {
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Admin can access all resources
  if (user.role === 'admin') {
    return null;
  }
  
  try {
    let data: { user_id: string | null } | null = null;
    let error: any = null;
    
    switch (resourceType) {
      case 'user_plants': {
        const result = await supabase
          .from('user_plants')
          .select('user_id')
          .eq('id', resourceId)
          .single();
        data = result.data;
        error = result.error;
        break;
      }
      case 'reminders': {
        const result = await supabase
          .from('reminders')
          .select('user_id')
          .eq('id', resourceId)
          .single();
        data = result.data;
        error = result.error;
        break;
      }
      case 'orders': {
        const result = await supabase
          .from('orders')
          .select('user_id')
          .eq('id', resourceId)
          .single();
        data = result.data;
        error = result.error;
        break;
      }
      case 'cart': {
        const result = await supabase
          .from('cart')
          .select('user_id')
          .eq('id', resourceId)
          .single();
        data = result.data;
        error = result.error;
        break;
      }
      default:
        return NextResponse.json(
          { error: 'Invalid resource type' },
          { status: 400 }
        );
    }
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    if (data.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return null;
  } catch (error) {
    return NextResponse.json(
      { error: 'Ownership verification failed' },
      { status: 500 }
    );
  }
}



// Combined middleware composer
export function createMiddleware(options: {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  checkOwnership?: { resourceType: string; resourceIdParam: string };
  enableRateLimit?: boolean;
}) {
  return async function middleware(request: NextRequest) {
    try {
      // Rate limiting
      if (options.enableRateLimit) {
        const rateLimitResponse = await withRateLimit(request);
        if (rateLimitResponse) return rateLimitResponse;
      }
      

      
      let user = null;
      
      // Authentication
      if (options.requireAuth || options.requireAdmin || options.checkOwnership) {
        const authResult = await withAuth(request);
        if (authResult.error) return authResult.error;
        user = authResult.user;
      }
      
      // Admin role check
      if (options.requireAdmin) {
        const adminResponse = withAdminRole(user);
        if (adminResponse) return adminResponse;
      }
      
      // Ownership check
      if (options.checkOwnership && user) {
        const url = new URL(request.url);
        const resourceId = url.pathname.split('/').pop() || '';
        
        const ownershipResponse = await withOwnership(
          user,
          options.checkOwnership.resourceType,
          resourceId
        );
        if (ownershipResponse) return ownershipResponse;
      }
      
      // Add user to request for downstream handlers
      if (user) {
        (request as any).user = user;
      }
      
      return null; // Continue to handler
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}