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
  { params }: { params: { id: string } }
) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true
    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const { id } = await params;
    const result = await productService.findBySlug(id);

    if (!result.success) {
      return handleApiError(createError.notFound('Product', id));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, `/api/products/${id}`);
  }
}

// PUT /api/products/[id] - Update product (admin only)
export async function PUT(
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

    const body = await request.json();

    // Validate input
    const validation = validateData(ProductUpdateSchema, body);
    if (!validation.success) {
      return handleApiError(createError.validation(
        `Validation failed: ${validation.errors?.join(', ')}`,
        validation.errors
      ));
    }

    const result = await productService.update(params.id, validation.data);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, `/api/products/${params.id}`);
  }
}

// DELETE /api/products/[id] - Delete product (admin only)
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

    const result = await productService.delete(params.id);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, `/api/products/${params.id}`);
  }
}