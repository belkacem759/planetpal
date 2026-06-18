import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { ReminderService } from '@/lib/db';
import { ReminderInsertSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse } from '@/lib/errors';
import { validateData } from '@/lib/validation';

const reminderService = new ReminderService();

// GET /api/reminders - Get user's reminders (authenticated user)
export async function GET(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return handleApiError(new Error('User ID not found'));
    }

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const days = Number.parseInt(searchParams.get('days') || '7');

    let result;
    result = await (upcoming ? reminderService.getUpcomingReminders(userId, days) : reminderService.getUserReminders(userId));
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, '/api/reminders');
  }
}

// POST /api/reminders - Create reminder (authenticated user)
export async function POST(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
  
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return handleApiError(new Error('User ID not found'));
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateData(ReminderInsertSchema, {
      ...body,
      user_id: userId
    });
    if (!validation.success) {
      return handleApiError(new Error(`Validation failed: ${validation.errors?.join(', ')}`));
    }

    const result = await reminderService.createReminder(userId, validation.data);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, '/api/reminders');
  }
}