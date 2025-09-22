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
    const categories = searchParams.getAll('categories'); // Get multiple categories
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const difficulty = searchParams.get('difficulty');
    const isPlant = searchParams.get('isPlant');
    const difficultyLevel = searchParams.get('difficulty_level');
    const maxCareDifficulty = searchParams.get('max_care_difficulty');
    const waterFilter = searchParams.get('care_difficulty_water');
    const lightFilter = searchParams.get('care_difficulty_light');
    const humidityFilter = searchParams.get('care_difficulty_humidity');
    const fertilizerFilter = searchParams.get('care_difficulty_fertilizer');
    const temperatureFilter = searchParams.get('care_difficulty_temperature');
    
    // Start building the query
    const supabase = await createClient();
    let query = supabase.from('products').select(`
      *,
      categories!inner(slug, name)
    `, { count: 'exact' });
    
    // Apply filters conditionally
    if (categories && categories.length > 0) {
      query = query.in('categories.slug', categories);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }
    
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    if (isPlant === 'true') {
      query = query.eq('is_plant', true);
    } else if (isPlant === 'false') {
      query = query.eq('is_plant', false);
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