/**
 * FNV-1a 32-bit over the generated chunk arrays.
 * Each uint16 is hashed little-endian. Chunk order is cy, then cx.
 * Ground, then block, then hp.
 */
export function hashWorld(world) {
  let h = 2166136261;
  const chunks = world.chunks;
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    h = hashU16(h, c.ground);
    h = hashU16(h, c.block);
    h = hashU16(h, c.hp);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function fnv1aBytes(bytes) {
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hashU16(h, arr) {
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    h ^= v & 0xff;
    h = Math.imul(h, 16777619);
    h ^= (v >>> 8) & 0xff;
    h = Math.imul(h, 16777619);
  }
  return h;
}
