import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client using Upstash KV
const redis = new Redis({
  url: process.env.KVR_KV_REST_API_URL!,
  token: process.env.KVR_KV_REST_API_TOKEN!,
});

// Rate limiters for different endpoints
export const conversationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute per IP
  analytics: true,
  prefix: 'ratelimit:conversation',
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes per IP
  analytics: true,
  prefix: 'ratelimit:auth',
});

export const surveyCreationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 surveys per hour per user
  analytics: true,
  prefix: 'ratelimit:survey',
});

// Helper to get client IP from request
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}
