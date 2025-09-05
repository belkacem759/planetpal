import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { UserService } from '@/lib/db';
import { UserInsertSchema, UserUpdateSchema, PaginationSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createPaginatedResponse } from '@/lib/errors';
import { validateData } from '@/lib/validation';

const userService = new UserService();

// GET /api/users - List users (admin only)
export async function GET(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
      requireAdmin: true
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;

    // Validate pagination
    const paginationValidation = validateData(PaginationSchema, { page, limit });
    if (!paginationValidation.success) {
      return handleApiError(new Error('Invalid pagination parameters'));
    }

    const result = await userService.findManyPaginated(page, limit);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createPaginatedResponse(result.data.data, {
      page,
      limit,
      total: result.data.count
    });
  } catch (error) {
    return handleApiError(error, '/api/users');
  }
}

// POST /api/users - Create user (admin only)
export async function POST(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
      requireAdmin: true,
  
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const body = await request.json();
    
    // Validate input
    const validation = validateData(UserInsertSchema, body);
    if (!validation.success) {
      return handleApiError(new Error(`Validation failed: ${validation.errors?.join(', ')}`));
    }

    const result = await userService.create(validation.data);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data, {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, '/api/users');
  }
}