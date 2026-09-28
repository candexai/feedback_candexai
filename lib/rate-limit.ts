type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((hit) => now - hit < windowMs);
  if (bucket.hits.length >= limit) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - bucket.hits[0])) / 1000));
    buckets.set(key, bucket);
    return { ok: false as const, retryAfter };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true as const };
}
