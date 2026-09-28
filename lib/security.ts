export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const raw = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return raw.slice(0, 80);
}

export function requestMeta(request: Request) {
  return {
    ip: clientIp(request),
    userAgent: (request.headers.get("user-agent") || "unknown").slice(0, 400),
    acceptLanguage: (request.headers.get("accept-language") || "").slice(0, 120),
  };
}
