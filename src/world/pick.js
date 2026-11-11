import { TILE } from '../config.js';
import { BLOCK_EMPTY, BLOCK_STUMP } from '../config.js';
import { ID } from './TileRegistry.js';

const HEIGHT = {
  [ID.tree]: 32,
  [ID.wall]: 24,
};

/**
 * Block under a world pixel. Tall sprites (tree, wall) extend north of their
 * tile, so a click on the canopy or the wall top still selects that block.
 * The farther-south sprite wins when both cover the point (it draws in front).
 */
export function pickBlock(world, x, y) {
  if (x < 0 || y < 0) return null;
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  let chosen = -1;
  for (let dy = 0; dy <= 1; dy++) {
    const cy = ty + dy;
    if (!world.inBounds(tx, cy)) continue;
    const id = world.getBlock(tx, cy);
    if (id === BLOCK_EMPTY || id === BLOCK_STUMP) continue;
    if (!spriteCovers(id, tx, cy, x, y)) continue;
    chosen = cy;
  }
  if (chosen < 0) return null;
  return { tx, ty: chosen, id: world.getBlock(tx, chosen) };
}

export function spriteCovers(blockId, tx, ty, x, y) {
  const left = tx * TILE;
  const right = left + TILE;
  if (x < left || x >= right) return false;
  const feet = (ty + 1) * TILE;
  const height = HEIGHT[blockId] || TILE;
  const top = feet - height;
  return y >= top && y < feet;
}

/** Euclidean distance in tiles from the player's feet-tile centre to a cell centre. */
export function reachDistance(px, py, tx, ty) {
  const cx = px / TILE;
  const cy = (py - TILE * 0.5) / TILE;
  const dx = cx - (tx + 0.5);
  const dy = cy - (ty + 0.5);
  return Math.hypot(dx, dy);
}
