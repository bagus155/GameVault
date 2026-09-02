const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// In-memory store: Map<identifier, { count: number, resetTime: number }>
const rateLimitMap = new Map();

/**
 * Basic in-memory rate limiter.
 * @param {string} identifier - Unik ID untuk limit (misal: IP address atau userId + action)
 * @param {number} limit - Jumlah maksimal request yang diizinkan dalam window
 * @returns {{ success: boolean, limit: number, remaining: number, resetTime: number }}
 */
export function rateLimit(identifier, limit = 5) {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || record.resetTime < now) {
    // Reset or initialize
    const newRecord = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(identifier, newRecord);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (record.count >= limit) {
    // Limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}
