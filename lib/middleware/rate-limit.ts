interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `rate_limit:${identifier}`;
  
  const existing = rateLimitStore.get(key);
  
  // Clean up expired entries
  if (existing && now > existing.resetTime) {
    rateLimitStore.delete(key);
  }
  
  const current = rateLimitStore.get(key) || {
    count: 0,
    resetTime: now + RATE_LIMIT_WINDOW
  };
  
  current.count += 1;
  rateLimitStore.set(key, current);
  
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - current.count);
  const success = current.count <= RATE_LIMIT_MAX_REQUESTS;
  
  return {
    success,
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining,
    reset: Math.ceil(current.resetTime / 1000)
  };
}

// Cleanup function to remove expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);