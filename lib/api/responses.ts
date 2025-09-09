import { NextResponse } from 'next/server';

// Standard API response structure
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any[];
  message?: string;
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

// Error response helper
export function createErrorResponse(
  error: string,
  status: number = 400,
  errors?: any[]
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      errors,
    },
    { status }
  );
}

// Validation error response helper
export function createValidationErrorResponse(
  errors: any[],
  message: string = 'Validation failed'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errors,
    },
    { status: 400 }
  );
}