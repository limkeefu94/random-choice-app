const rateLimitBuckets = globalThis.__randomChoiceRateLimitBuckets || new Map();

globalThis.__randomChoiceRateLimitBuckets = rateLimitBuckets;

function isDevRateLimitMode() {
  return String(process.env.ALLOW_DEV_RATE_LIMITS || "").toLowerCase() === "true";
}

function getPositiveIntegerEnv(name, fallback) {
  const value = Number.parseInt(process.env[name], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getClientIp(request) {
  const forwardedFor = request.headers?.["x-forwarded-for"] || request.headers?.["X-Forwarded-For"] || "";
  const firstForwardedIp = String(forwardedFor).split(",")[0].trim();
  return firstForwardedIp || request.headers?.["x-real-ip"] || request.socket?.remoteAddress || "unknown";
}

function getRateLimitConfig(options = {}) {
  const devMode = isDevRateLimitMode();
  const maxAttempts = getPositiveIntegerEnv(
    options.maxEnv,
    devMode ? options.devMax : options.max,
  );
  const windowMs = getPositiveIntegerEnv(
    options.windowEnv,
    devMode ? options.devWindowMs : options.windowMs,
  );

  return {
    maxAttempts,
    windowMs,
  };
}

function getBucket(key, windowMs, now = Date.now()) {
  return (rateLimitBuckets.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
}

function setRateLimitHeaders(response, { maxAttempts, remaining, retryAfterSeconds = 0 }) {
  response.setHeader("X-RateLimit-Limit", String(maxAttempts));
  response.setHeader("X-RateLimit-Remaining", String(Math.max(0, remaining)));

  if (retryAfterSeconds > 0) {
    response.setHeader("Retry-After", String(retryAfterSeconds));
  }
}

function checkRateLimit(request, response, options = {}) {
  const { maxAttempts, windowMs } = getRateLimitConfig(options);
  const keyParts = [options.name || "default", options.key || getClientIp(request)];
  const key = keyParts.join(":");
  const now = Date.now();
  const bucket = getBucket(key, windowMs, now);

  if (bucket.length >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - bucket[0])) / 1000));
    setRateLimitHeaders(response, {
      maxAttempts,
      remaining: 0,
      retryAfterSeconds,
    });
    return {
      allowed: false,
      retryAfterSeconds,
    };
  }

  setRateLimitHeaders(response, {
    maxAttempts,
    remaining: maxAttempts - bucket.length,
  });

  return {
    allowed: true,
    key,
    maxAttempts,
    windowMs,
  };
}

function recordRateLimitAttempt(checkResult) {
  if (!checkResult?.allowed || !checkResult.key) {
    return;
  }

  const bucket = getBucket(checkResult.key, checkResult.windowMs);
  bucket.push(Date.now());
  rateLimitBuckets.set(checkResult.key, bucket);
}

module.exports = {
  checkRateLimit,
  recordRateLimitAttempt,
};
