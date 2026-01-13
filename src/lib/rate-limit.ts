import { NextRequest } from 'next/server';

const ipCache = new Map<string, { count: number; lastReset: number }>();

// Config: Allow 20 requests per 10 seconds per IP
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds
const MAX_REQUESTS = 20;

export function isRateLimited(req: NextRequest): boolean {
  const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
  
  const now = Date.now();
  const record = ipCache.get(ip);

  // If new IP or window expired, reset
  if (!record || (now - record.lastReset > RATE_LIMIT_WINDOW)) {
    ipCache.set(ip, { count: 1, lastReset: now });
    return false;
  }

  // Increment
  record.count += 1;

  // Check limit
  if (record.count > MAX_REQUESTS) {
    return true; // BLOCKED
  }

  return false; // ALLOWED
}