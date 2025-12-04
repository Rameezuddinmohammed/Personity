import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RATE_LIMITS } from '@/lib/constants';

// Create Redis client using Upstash KV
const redis = new Redis({
  url: process.env.KVR_KV_REST_API_URL!,
  token: process.env.KVR_KV_REST_API_TOKEN!,
});

// Rate limiters for different endpoints
export const conversationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMITS.CONVERSATION_PER_MINUTE, '1 m'),
  analytics: true,
  prefix: 'ratelimit:conversation',
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMITS.AUTH_PER_15_MINUTES, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
});

export const surveyCreationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMITS.SURVEY_PER_HOUR, '1 h'),
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
