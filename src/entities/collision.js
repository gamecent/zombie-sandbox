import { FEET_HALF_W, FEET_HEIGHT, TILE } from '../config.js';

/** True when the feet box overlaps a solid cell. Position is the feet centre. */
export function feetBlocked(world, x, y) {
  const left = x - FEET_HALF_W;
  const right = x + FEET_HALF_W;
  const top = y - FEET_HEIGHT;
  const bottom = y;
  const x0 = Math.floor(left / TILE);
  const x1 = Math.floor((right - 1e-3) / TILE);
  const y0 = Math.floor(top / TILE);
  const y1 = Math.floor((bottom - 1e-3) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (world.isSolid(tx, ty)) return true;
    }
  }
  return false;
}

/** True when the feet box overlaps the given tile, even if that tile is empty. */
export function feetOverlapTile(x, y, tx, ty) {
  const left = x - FEET_HALF_W;
  const right = x + FEET_HALF_W;
  const top = y - FEET_HEIGHT;
  const bottom = y;
  const cl = tx * TILE;
  const ct = ty * TILE;
  const cr = cl + TILE;
  const cb = ct + TILE;
  return left < cr - 1e-3 && right - 1e-3 > cl && top < cb - 1e-3 && bottom - 1e-3 > ct;
}
