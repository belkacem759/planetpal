import { NextResponse } from 'next/server';

// Standard API response structure
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  errors?: any[];
  message?: string;
  success: boolean;
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      message,
      success: true,
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
      error,
      errors,
      success: false,
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
      error: message,
      errors,
      success: false,
    },
    { status: 400 }
  );
}