import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { CategoryService } from '@/lib/db';
import { CategoryUpdateSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createError } from '@/lib/errors';
import { validateData } from '@/lib/validation';

const categoryService = new CategoryService();

// GET /api/categories/[id] - Get category by ID (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const middleware = createMiddleware({
      enableRateLimit: true
    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const result = await categoryService.findBySlug(id);

    if (!result.success) {
      return handleApiError(createError.notFound('Category', id));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, `/api/categories/${id}`);
  }
}

// PUT /api/categories/[id] - Update category (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const validation = validateData(CategoryUpdateSchema, body);
    if (!validation.success) {
      return handleApiError(createError.validation(
        `Validation failed: ${validation.errors?.join(', ')}`,
        validation.errors
      ));
    }

    const result = await categoryService.update(id, validation.data);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, `/api/categories/${id}`);
  }
}

// DELETE /api/categories/[id] - Delete category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
      requireAdmin: true,

    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const result = await categoryService.delete(id);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, `/api/categories/${id}`);
  }
}