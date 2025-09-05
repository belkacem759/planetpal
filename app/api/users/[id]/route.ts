import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { UserService } from '@/lib/db';
import { UserUpdateSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createError } from '@/lib/errors';
import { validateData } from '@/lib/validation';

const userService = new UserService();

// GET /api/users/[id] - Get user by ID (admin or self)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
      checkOwnership: {
        resourceType: 'users',
        resourceIdParam: 'id'
      }
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const result = await userService.findById(params.id);
    
    if (!result.success) {
      return handleApiError(createError.notFound('User', params.id));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, `/api/users/${params.id}`);
  }
}

// PUT /api/users/[id] - Update user (admin or self)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
  
      checkOwnership: {
        resourceType: 'users',
        resourceIdParam: 'id'
      }
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const body = await request.json();
    
    // Validate input
    const validation = validateData(UserUpdateSchema, body);
    if (!validation.success) {
      return handleApiError(createError.validation(
        `Validation failed: ${validation.errors?.join(', ')}`,
        validation.errors
      ));
    }

    const result = await userService.update(params.id, validation.data);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, `/api/users/${params.id}`);
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
      requireAdmin: true,
  
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const result = await userService.delete(params.id);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, `/api/users/${params.id}`);
  }
}