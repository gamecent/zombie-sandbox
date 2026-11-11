/** mulberry32. Returns floats in [0, 1). Never used with Math.random for world gen. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function mulberry() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable uint32 from a URL seed. Numeric strings use their decimal value (mod 2^32). */
export function seedToUint32(seed) {
  const s = String(seed).trim();
  if (/^-?\d+$/.test(s)) {
    const neg = s.charCodeAt(0) === 45;
    let n = 0;
    for (let i = neg ? 1 : 0; i < s.length; i++) {
      n = (Math.imul(n, 10) + (s.charCodeAt(i) - 48)) >>> 0;
    }
    return neg ? (-n) >>> 0 : n;
  }
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic 32-bit mix of two tile coordinates and the world seed. */
export function hash2(x, y, seed) {
  let h = seed >>> 0;
  h ^= Math.imul(x | 0, 0x27d4eb2d);
  h = Math.imul(h, 0x85ebca6b);
  h ^= Math.imul(y | 0, 0x165667b1);
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
