const buckets = new Map();
export function rateLimit(key, limit = 8, windowMs = 60000) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || b.reset <= now) {
    b = { count: 0, reset: now + windowMs };
    buckets.set(key, b);
  }
  b.count++;
  return {
    allowed: b.count <= limit,
    retryAfter: Math.max(1, Math.ceil((b.reset - now) / 1000)),
  };
}
export function clientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
