import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { ProductService } from '@/lib/db';
import { ProductInsertSchema, PaginationSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createPaginatedResponse } from '@/lib/errors';
import { validateData } from '@/lib/validation';

const productService = new ProductService();

// GET /api/products - List products (public)
export async function GET(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true
    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('category') || undefined;

    // Validate pagination
    // const paginationValidation = validateData(PaginationSchema, { page, limit });
    // if (!paginationValidation.success) {
    //   return handleApiError(new Error('Invalid pagination parameters'));
    // }

    if (categoryId) {
      const result = await productService.findByCategory(categoryId);
      if (!result.success) {
        return handleApiError(new Error(result.error));
      }
      return createSuccessResponse(result.data);
    } else {
      const result = await productService.findManyPaginated(page, limit);
      if (!result.success) {
        return handleApiError(new Error(result.error));
      }
      return createPaginatedResponse(result.data.data, {
        page,
        limit,
        total: result.data.count
      });
    }
  } catch (error) {
    return handleApiError(error, '/api/products');
  }
}

// POST /api/products - Create product (admin only)
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
    const validation = validateData(ProductInsertSchema, body);
    if (!validation.success) {
      return handleApiError(new Error(`Validation failed: ${validation.errors?.join(', ')}`));
    }

    const result = await productService.create(validation.data);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, '/api/products');
  }
}