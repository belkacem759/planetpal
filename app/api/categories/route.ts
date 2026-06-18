import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { CategoryService } from '@/lib/db';
import { CategoryInsertSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createPaginatedResponse } from '@/lib/errors';
import { validateData } from '@/lib/validation';

const categoryService = new CategoryService();

// GET /api/categories - List categories (public)
export async function GET(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');

    // Validate pagination
    // const paginationValidation = validateData(PaginationSchema, { page, limit });
    // if (!paginationValidation.success) {
    //   return handleApiError(new Error('Invalid pagination parameters'));
    // }

    const result = await categoryService.findManyPaginated(page, limit);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createPaginatedResponse(result.data.data, {
      limit,
      page,
      total: result.data.count
    });
  } catch (error) {
    return handleApiError(error, '/api/categories');
  }
}

// POST /api/categories - Create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAdmin: true,
      requireAuth: true,
  
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const body = await request.json();
    
    // Validate input
    const validation = validateData(CategoryInsertSchema, body);
    if (!validation.success) {
      return handleApiError(new Error(`Validation failed: ${validation.errors?.join(', ')}`));
    }

    const result = await categoryService.create(validation.data);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, '/api/categories');
  }
}