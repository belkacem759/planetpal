import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { UserPlantService } from '@/lib/db';
import { UserPlantInsertSchema, PaginationSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createPaginatedResponse } from '@/lib/errors';
import { validateData } from '@/lib/validation';

const userPlantService = new UserPlantService();

// GET /api/user-plants - Get user's plants (authenticated user)
export async function GET(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return handleApiError(new Error('User ID not found'));
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate pagination
    const paginationValidation = validateData(PaginationSchema, { page, limit });
    if (!paginationValidation.success) {
      return handleApiError(new Error('Invalid pagination parameters'));
    }

    const result = await userPlantService.getUserPlants(userId);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, '/api/user-plants');
  }
}

// POST /api/user-plants - Add plant to user's collection (authenticated user)
export async function POST(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
  
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return handleApiError(new Error('User ID not found'));
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateData(UserPlantInsertSchema, {
      ...body,
      user_id: userId
    });
    if (!validation.success) {
      return handleApiError(new Error(`Validation failed: ${validation.errors?.join(', ')}`));
    }

    const result = await userPlantService.createUserPlant(userId, validation.data);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, '/api/user-plants');
  }
}