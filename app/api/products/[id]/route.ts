import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { ProductService } from '@/lib/db';
import { ProductUpdateSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createError } from '@/lib/errors';
import { validateData } from '@/lib/validation';

const productService = new ProductService();

// GET /api/products/[id] - Get product by ID (public)
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

    const result = await productService.findBySlug(id);

    if (!result.success) {
      return handleApiError(createError.notFound('Product', id));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, `/api/products/${id}`);
  }
}

// PUT /api/products/[id] - Update product (admin only)
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
    const validation = validateData(ProductUpdateSchema, body);
    if (!validation.success) {
      return handleApiError(createError.validation(
        `Validation failed: ${validation.errors?.join(', ')}`,
        validation.errors
      ));
    }

    const result = await productService.update(id, validation.data);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, `/api/products/${id}`);
  }
}

// DELETE /api/products/[id] - Delete product (admin only)
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

    const result = await productService.delete(id);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, `/api/products/${id}`);
  }
}