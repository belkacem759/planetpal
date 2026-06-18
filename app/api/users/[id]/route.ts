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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const middleware = createMiddleware({
      checkOwnership: {
        resourceIdParam: 'id',
        resourceType: 'users'
      },
      enableRateLimit: true,
      requireAuth: true
    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const result = await userService.findById(id);

    if (!result.success) {
      return handleApiError(createError.notFound('User', id));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, `/api/users/${id}`);
  }
}

// PUT /api/users/[id] - Update user (admin or self)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const middleware = createMiddleware({
      checkOwnership: {
        resourceIdParam: 'id',
        resourceType: 'users'
      },
      enableRateLimit: true,

      requireAuth: true
    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const body = await request.json();
    
    // Validate input
    const validation = validateData(UserUpdateSchema, body);
    if (!validation.success) {
      return handleApiError(createError.validation(
        `Validation failed: ${validation.errors?.join(', ')}`,
        validation.errors
      ));
    }

    const result = await userService.update(id, validation.data);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, `/api/users/${id}`);
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAdmin: true,
      requireAuth: true,

    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const result = await userService.delete(id);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, `/api/users/${id}`);
  }
}