import { createNoise2D } from 'simplex-noise';
import {
  BLOCK_EMPTY,
  SPAWN_TILE_X,
  SPAWN_TILE_Y,
  WORLD_SIZE,
} from '../config.js';
import { hash2, mulberry32 } from '../util/rng.js';
import { ID } from './TileRegistry.js';
import { getTile } from './TileRegistry.js';

/**
 * Fill ground and block layers. Callers must not use Math.random on this path.
 * Spawn (world centre) is forced to open grass so the player is never boxed in.
 */
export function generate(world, seedUint) {
  const continental = createNoise2D(mulberry32(seedUint));
  const detail = createNoise2D(mulberry32((seedUint + 0x85ebca6b) >>> 0));
  const forest = createNoise2D(mulberry32((seedUint + 0xc2b2ae35) >>> 0));
  const rocky = createNoise2D(mulberry32((seedUint + 0x27d4eb2d) >>> 0));

  const treeHp = getTile('tree').hp;
  const rockHp = getTile('rock').hp;

  for (let ty = 0; ty < WORLD_SIZE; ty++) {
    for (let tx = 0; tx < WORLD_SIZE; tx++) {
      const cheb = chebyshev(tx - SPAWN_TILE_X, ty - SPAWN_TILE_Y);
      const c = continental(tx * 0.016, ty * 0.016);
      const d = detail(tx * 0.05, ty * 0.05);

      let ground = ID.grass;
      if (cheb > 7 && c < -0.22 && d < 0.35) ground = ID.water;
      else if (cheb > 4 && d > 0.4) ground = ID.dirt;

      const chunk = world.chunkAtTile(tx, ty);
      const i = world.indexInChunk(tx, ty);
      chunk.ground[i] = ground;
      chunk.block[i] = BLOCK_EMPTY;
      chunk.hp[i] = 0;

      if (ground === ID.water || cheb <= 8) continue;

      const micro = (hash2(tx, ty, seedUint) % 1000) / 1000;
      const f = forest(tx * 0.08, ty * 0.08);
      const r = rocky(tx * 0.11 + 80, ty * 0.11 + 80);

      if (f > 0.02 && micro > 0.58 && !nearBlock(world, tx, ty, 2)) {
        chunk.block[i] = ID.tree;
        chunk.hp[i] = treeHp;
      } else if (r > 0.28 && micro > 0.9 && !nearBlock(world, tx, ty, 2)) {
        chunk.block[i] = ID.rock;
        chunk.hp[i] = rockHp;
      }
    }
  }
}

function chebyshev(dx, dy) {
  const ax = dx < 0 ? -dx : dx;
  const ay = dy < 0 ? -dy : dy;
  return ax > ay ? ax : ay;
}

function nearBlock(world, tx, ty, radius) {
  const x0 = Math.max(0, tx - radius);
  const y0 = Math.max(0, ty - radius);
  const x1 = Math.min(WORLD_SIZE - 1, tx + radius);
  const y1 = Math.min(WORLD_SIZE - 1, ty + radius);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (x === tx && y === ty) continue;
      if (world.getBlock(x, y) !== BLOCK_EMPTY) return true;
    }
  }
  return false;
}
