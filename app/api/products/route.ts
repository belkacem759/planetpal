import { NextRequest, NextResponse } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { ProductService } from '@/lib/db';
import { ProductInsertSchema, PaginationSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createPaginatedResponse } from '@/lib/errors';
import { validateData } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';

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
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Extract individual filter parameters
    const categoryId = searchParams.get('category_id');
    const difficultyLevel = searchParams.get('difficulty_level');
    const maxCareDifficulty = searchParams.get('max_care_difficulty');
    const waterFilter = searchParams.get('water');
    const lightFilter = searchParams.get('light');
    const humidityFilter = searchParams.get('humidity');
    const fertilizerFilter = searchParams.get('fertilizer');
    const temperatureFilter = searchParams.get('temperature');
    
    // Start building the query
    const supabase = await createClient();
    let query = supabase.from('products').select('*', { count: 'exact' });
    
    // Apply filters conditionally
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (difficultyLevel) {
      query = query.eq('difficulty_level', difficultyLevel);
    }
    
    if (waterFilter) {
      query = query.lte('care_instructions->water->difficulty', parseInt(waterFilter));
    }
    
    if (lightFilter) {
      query = query.lte('care_instructions->light->difficulty', parseInt(lightFilter));
    }
    
    if (humidityFilter) {
      query = query.lte('care_instructions->humidity->difficulty', parseInt(humidityFilter));
    }
    
    if (fertilizerFilter) {
      query = query.lte('care_instructions->fertilizer->difficulty', parseInt(fertilizerFilter));
    }
    
    if (temperatureFilter) {
      query = query.lte('care_instructions->temperature->difficulty', parseInt(temperatureFilter));
    }
    
    if (maxCareDifficulty) {
      const maxDiff = parseInt(maxCareDifficulty);
      query = query.or(`care_instructions->light->difficulty.lte.${maxDiff},care_instructions->water->difficulty.lte.${maxDiff},care_instructions->humidity->difficulty.lte.${maxDiff},care_instructions->fertilizer->difficulty.lte.${maxDiff},care_instructions->temperature->difficulty.lte.${maxDiff}`);
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const totalPages = Math.ceil((count || 0) / limit);
    
    const result = {
      success: true,
      data: {
        data: data || [],
        count: count || 0,
        page,
        totalPages
      }
    };
    
    return createPaginatedResponse(result.data.data, {
      page,
      limit,
      total: result.data.count
    })
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

    const result = await productService.create(validation.data as any);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, '/api/products');
  }
}