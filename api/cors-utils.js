const DEFAULT_ALLOWED_HEADERS = ["Authorization", "Content-Type"];
const DEFAULT_MAX_AGE_SECONDS = 86400;

function normalizeOrigin(origin) {
  const trimmedOrigin = String(origin || "").trim();

  if (!trimmedOrigin || trimmedOrigin === "null") {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmedOrigin);
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
  } catch {
    return "";
  }
}

function getRequestOrigin(request) {
  return request.headers?.origin || request.headers?.Origin || "";
}

function getConfiguredOrigins() {
  return String(process.env.APP_ALLOWED_ORIGIN || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);
}

function isDevCorsAllowed() {
  return String(process.env.ALLOW_DEV_CORS || "").toLowerCase() === "true";
}

function resolveAllowedOrigin(request) {
  const requestOrigin = normalizeOrigin(getRequestOrigin(request));

  if (isDevCorsAllowed()) {
    return requestOrigin || "*";
  }

  if (!requestOrigin) {
    return "";
  }

  return getConfiguredOrigins().includes(requestOrigin) ? requestOrigin : "";
}

function formatHeaderList(value) {
  return Array.isArray(value) ? value.join(", ") : String(value || "");
}

function appendVary(response, value) {
  const currentValue = response.getHeader?.("Vary") || "";
  const varyValues = new Set(
    String(currentValue)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

  varyValues.add(value);
  response.setHeader("Vary", [...varyValues].join(", "));
}

function setCors(request, response, options = {}) {
  const allowedOrigin = resolveAllowedOrigin(request);
  const methods = options.methods || ["GET", "POST", "OPTIONS"];
  const headers = options.headers || DEFAULT_ALLOWED_HEADERS;
  const maxAgeSeconds = options.maxAgeSeconds || DEFAULT_MAX_AGE_SECONDS;

  if (allowedOrigin) {
    response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }

  appendVary(response, "Origin");
  response.setHeader("Access-Control-Allow-Methods", formatHeaderList(methods));
  response.setHeader("Access-Control-Allow-Headers", formatHeaderList(headers));
  response.setHeader("Access-Control-Max-Age", String(maxAgeSeconds));
}

module.exports = {
  setCors,
};
