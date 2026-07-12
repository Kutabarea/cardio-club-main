type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, RateLimitBucket>();
const maxBuckets = 5000;

function cleanupExpiredBuckets(now: number) {
  if (buckets.size < maxBuckets) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function rateLimit({
  key,
  limit,
  windowMs,
}: RateLimitInput): RateLimitResult {
  const now = Date.now();

  cleanupExpiredBuckets(now);

  const existingBucket = buckets.get(key);

  if (!existingBucket || existingBucket.resetAt <= now) {
    const resetAt = now + windowMs;

    buckets.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      limit,
      remaining: Math.max(limit - 1, 0),
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  existingBucket.count += 1;

  const remaining = Math.max(limit - existingBucket.count, 0);
  const retryAfterSeconds = Math.max(
    Math.ceil((existingBucket.resetAt - now) / 1000),
    1,
  );

  return {
    allowed: existingBucket.count <= limit,
    limit,
    remaining,
    resetAt: existingBucket.resetAt,
    retryAfterSeconds,
  };
}