import {
  BLOCK_EMPTY,
  BLOCK_STUMP,
  CHUNK,
  WORLD_CHUNKS,
  WORLD_SIZE,
} from '../config.js';
import { hashWorld } from '../util/hash.js';
import { mulberry32, seedToUint32 } from '../util/rng.js';
import { Chunk } from './Chunk.js';
import { generate } from './WorldGen.js';
import { tiles } from './TileRegistry.js';

const CHUNK_MASK = CHUNK - 1;

export class World {
  constructor(seed) {
    this.seed = String(seed);
    this.seedUint = seedToUint32(seed);
    this.chunks = new Array(WORLD_CHUNKS * WORLD_CHUNKS);
    for (let cy = 0; cy < WORLD_CHUNKS; cy++) {
      for (let cx = 0; cx < WORLD_CHUNKS; cx++) {
        this.chunks[cy * WORLD_CHUNKS + cx] = new Chunk(cx, cy);
      }
    }
    generate(this, this.seedUint);
    this.hash = hashWorld(this);
    // Gameplay rolls (drops) stay off the generation RNGs so the hash cannot drift.
    this.rng = mulberry32((this.seedUint + 0x9e3779b9) >>> 0);
    this.noiseAmount = 0;
  }

  chunkAtTile(tx, ty) {
    return this.chunks[((ty >> 5) * WORLD_CHUNKS) + (tx >> 5)];
  }

  indexInChunk(tx, ty) {
    return ((ty & CHUNK_MASK) << 5) + (tx & CHUNK_MASK);
  }

  inBounds(tx, ty) {
    return tx >= 0 && ty >= 0 && tx < WORLD_SIZE && ty < WORLD_SIZE;
  }

  getGround(tx, ty) {
    const chunk = this.chunkAtTile(tx, ty);
    return chunk.ground[this.indexInChunk(tx, ty)];
  }

  getBlock(tx, ty) {
    const chunk = this.chunkAtTile(tx, ty);
    return chunk.block[this.indexInChunk(tx, ty)];
  }

  getHp(tx, ty) {
    const chunk = this.chunkAtTile(tx, ty);
    return chunk.hp[this.indexInChunk(tx, ty)];
  }

  isSolid(tx, ty) {
    if (!this.inBounds(tx, ty)) return true;
    const ground = tiles[this.getGround(tx, ty)];
    if (ground && ground.solid) return true;
    const block = this.getBlock(tx, ty);
    if (block === BLOCK_EMPTY || block === BLOCK_STUMP) return false;
    const def = tiles[block];
    return !!(def && def.solid);
  }

  setBlock(tx, ty, blockId, hp) {
    const chunk = this.chunkAtTile(tx, ty);
    const index = this.indexInChunk(tx, ty);
    chunk.block[index] = blockId;
    chunk.hp[index] = hp;
    chunk.markEdit(index);
  }

  setHp(tx, ty, hp) {
    const chunk = this.chunkAtTile(tx, ty);
    const index = this.indexInChunk(tx, ty);
    chunk.hp[index] = hp;
    chunk.markEdit(index);
  }

  /**
   * Ground edits retile the 3x3 neighbourhood. Edge cells mark the neighbour
   * chunk dirty as well. The view redraws each dirty chunk at most once a frame.
   */
  setGround(tx, ty, groundId) {
    const chunk = this.chunkAtTile(tx, ty);
    const index = this.indexInChunk(tx, ty);
    if (chunk.ground[index] === groundId) return;
    chunk.ground[index] = groundId;
    chunk.markEdit(index);
    this.markGroundArea(tx, ty);
  }

  markGroundArea(tx, ty) {
    for (let y = ty - 1; y <= ty + 1; y++) {
      if (y < 0 || y >= WORLD_SIZE) continue;
      for (let x = tx - 1; x <= tx + 1; x++) {
        if (x < 0 || x >= WORLD_SIZE) continue;
        this.chunkAtTile(x, y).groundDirty = true;
      }
    }
  }

  applyChunkDiff(cx, cy, cells) {
    const chunk = this.chunks[cy * WORLD_CHUNKS + cx];
    let groundChanged = false;
    for (let k = 0; k < cells.length; k++) {
      const cell = cells[k];
      if (chunk.ground[cell.i] !== cell.ground) groundChanged = true;
      chunk.ground[cell.i] = cell.ground;
      chunk.block[cell.i] = cell.block;
      chunk.hp[cell.i] = cell.hp;
      chunk.markEdit(cell.i);
    }
    chunk.blocksDirty = true;
    if (groundChanged) {
      const tx = cx * CHUNK;
      const ty = cy * CHUNK;
      this.markGroundArea(tx, ty);
      this.markGroundArea(tx + CHUNK - 1, ty);
      this.markGroundArea(tx, ty + CHUNK - 1);
      this.markGroundArea(tx + CHUNK - 1, ty + CHUNK - 1);
    }
  }
}

/** 4-neighbour bitmask. N=1 E=2 S=4 W=8. Outside the map counts as the same type. */
export function groundMask(world, tx, ty) {
  const id = world.getGround(tx, ty);
  let mask = 0;
  if (ty === 0 || world.getGround(tx, ty - 1) === id) mask |= 1;
  if (tx === WORLD_SIZE - 1 || world.getGround(tx + 1, ty) === id) mask |= 2;
  if (ty === WORLD_SIZE - 1 || world.getGround(tx, ty + 1) === id) mask |= 4;
  if (tx === 0 || world.getGround(tx - 1, ty) === id) mask |= 8;
  return mask;
}
