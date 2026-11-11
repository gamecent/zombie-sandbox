import { BLOCK_EMPTY, CHUNK, TILE, WORLD_CHUNKS, WORLD_PIXELS } from '../config.js';
import { groundFrames, ID, getTile } from './TileRegistry.js';
import { groundMask } from './World.js';
import { blockFrame, crackFrameFor, placeFeetSprite } from '../entities/WallSprite.js';

const CHUNK_PIXELS = CHUNK * TILE;

/**
 * Ground is one RenderTexture per chunk. Blocks are pooled sprites so they
 * y-sort with the player. Only chunks near the camera stay active.
 */
export class ChunkView {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.pool = [];
    this.map = new Array(WORLD_CHUNKS * WORLD_CHUNKS);
    this.frameId = 1;
    this.wallMaxHp = getTile('wall_wood').hp;
  }

  update(camera, focusX, focusY) {
    const viewW = camera.width / camera.zoom;
    const viewH = camera.height / camera.zoom;
    let left = focusX - viewW / 2;
    let top = focusY - viewH / 2;
    const maxLeft = WORLD_PIXELS - viewW;
    const maxTop = WORLD_PIXELS - viewH;
    if (left < 0) left = 0;
    else if (maxLeft > 0 && left > maxLeft) left = maxLeft;
    if (top < 0) top = 0;
    else if (maxTop > 0 && top > maxTop) top = maxTop;
    const right = left + viewW;
    const bottom = top + viewH;
    const pad = CHUNK_PIXELS;
    const minCx = clampChunk(Math.floor((left - pad) / CHUNK_PIXELS));
    const maxCx = clampChunk(Math.floor((right + pad) / CHUNK_PIXELS));
    const minCy = clampChunk(Math.floor((top - pad) / CHUNK_PIXELS));
    const maxCy = clampChunk(Math.floor((bottom + pad) / CHUNK_PIXELS));
    const mark = this.frameId++;

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const index = cy * WORLD_CHUNKS + cx;
        let renderer = this.map[index];
        if (!renderer) {
          renderer = this._create(cx, cy);
          this.map[index] = renderer;
        }
        renderer.wanted = mark;
      }
    }

    const map = this.map;
    for (let i = 0; i < map.length; i++) {
      const renderer = map[i];
      if (!renderer) continue;
      const on = renderer.wanted === mark;
      renderer.rt.setVisible(on);
      if (!on) {
        if (renderer.spritesLive) this._releaseSprites(renderer);
        continue;
      }
      if (renderer.chunk.groundDirty) this._drawGround(renderer);
      if (!renderer.spritesLive || renderer.chunk.blocksDirty) this._buildSprites(renderer);
    }
  }

  syncCell(tx, ty) {
    const cx = tx >> 5;
    const cy = ty >> 5;
    const renderer = this.map[cy * WORLD_CHUNKS + cx];
    if (!renderer || !renderer.spritesLive) {
      this.world.chunkAtTile(tx, ty).blocksDirty = true;
      return;
    }
    this._syncOne(renderer, tx, ty);
  }

  flashCell(tx, ty) {
    const record = this.recordAt(tx, ty);
    if (!record) return;
    const sprite = record.main;
    sprite.setTint(0xff8888);
    const token = (sprite._flashToken = (sprite._flashToken || 0) + 1);
    this.scene.time.delayedCall(90, () => {
      if (sprite._flashToken === token) sprite.clearTint();
    });
  }

  recordAt(tx, ty) {
    if (!this.world.inBounds(tx, ty)) return null;
    const renderer = this.map[((ty >> 5) * WORLD_CHUNKS) + (tx >> 5)];
    if (!renderer || !renderer.spritesLive) return null;
    return renderer.records[((ty & 31) << 5) + (tx & 31)];
  }

  _create(cx, cy) {
    const chunk = this.world.chunks[cy * WORLD_CHUNKS + cx];
    const rt = this.scene.add.renderTexture(cx * CHUNK_PIXELS, cy * CHUNK_PIXELS, CHUNK_PIXELS, CHUNK_PIXELS);
    rt.setOrigin(0, 0);
    rt.setDepth(0);
    return {
      cx,
      cy,
      chunk,
      rt,
      records: new Array(CHUNK * CHUNK),
      spritesLive: false,
      wanted: 0,
    };
  }

  _drawGround(renderer) {
    const rt = renderer.rt;
    const chunk = renderer.chunk;
    const baseX = chunk.cx * CHUNK;
    const baseY = chunk.cy * CHUNK;
    const ground = chunk.ground;
    rt.clear();
    rt.beginDraw();
    try {
      for (let ly = 0; ly < CHUNK; ly++) {
        const row = ly << 5;
        const ty = baseY + ly;
        const py = ly * TILE;
        for (let lx = 0; lx < CHUNK; lx++) {
          const gid = ground[row + lx];
          const frames = groundFrames[gid];
          const frame = frames
            ? frames[groundMask(this.world, baseX + lx, ty)]
            : 'grass_15';
          rt.batchDrawFrame('main', frame, lx * TILE, py);
        }
      }
    } finally {
      rt.endDraw();
    }
    chunk.groundDirty = false;
  }

  _buildSprites(renderer) {
    this._releaseSprites(renderer);
    const baseX = renderer.chunk.cx * CHUNK;
    const baseY = renderer.chunk.cy * CHUNK;
    const block = renderer.chunk.block;
    for (let ly = 0; ly < CHUNK; ly++) {
      const row = ly << 5;
      const ty = baseY + ly;
      for (let lx = 0; lx < CHUNK; lx++) {
        if (block[row + lx] !== BLOCK_EMPTY) this._syncOne(renderer, baseX + lx, ty);
      }
    }
    renderer.spritesLive = true;
    renderer.chunk.blocksDirty = false;
  }

  _syncOne(renderer, tx, ty) {
    const lx = tx & 31;
    const ly = ty & 31;
    const index = (ly << 5) + lx;
    const blockId = renderer.chunk.block[index];
    const hp = renderer.chunk.hp[index];
    let record = renderer.records[index];
    if (blockId === BLOCK_EMPTY) {
      if (record) {
        this._releaseRecord(record);
        renderer.records[index] = null;
      }
      return;
    }
    if (!record) {
      record = { main: this._obtain(), crack: null, blockId: 0 };
      renderer.records[index] = record;
    }
    record.blockId = blockId;
    const frame = blockFrame(blockId, tx, ty, this.world);
    const feetY = placeFeetSprite(record.main, tx, ty, frame);
    const crackName = blockId === ID.wall ? crackFrameFor(hp, this.wallMaxHp) : null;
    if (crackName) {
      if (!record.crack) record.crack = this._obtain();
      placeFeetSprite(record.crack, tx, ty, crackName);
      record.crack.setDepth(feetY + 0.1);
    } else if (record.crack) {
      this._release(record.crack);
      record.crack = null;
    }
  }

  _releaseSprites(renderer) {
    const records = renderer.records;
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (!record) continue;
      this._releaseRecord(record);
      records[i] = null;
    }
    renderer.spritesLive = false;
    renderer.chunk.blocksDirty = true;
  }

  _releaseRecord(record) {
    this._release(record.main);
    if (record.crack) this._release(record.crack);
  }

  _obtain() {
    let sprite = this.pool.pop();
    if (!sprite) {
      sprite = this.scene.add.sprite(0, 0, 'main', 'tree');
      sprite.setOrigin(0.5, 1);
    }
    sprite._flashToken = (sprite._flashToken || 0) + 1;
    sprite.setActive(true);
    sprite.setVisible(true);
    sprite.setAlpha(1);
    sprite.clearTint();
    sprite.setFlipX(false);
    if (sprite.isCropped) sprite.setCrop();
    return sprite;
  }

  _release(sprite) {
    sprite._flashToken = (sprite._flashToken || 0) + 1;
    sprite.setVisible(false);
    sprite.setActive(false);
    sprite.clearTint();
    if (sprite.isCropped) sprite.setCrop();
    this.pool.push(sprite);
  }
}

function clampChunk(value) {
  if (value < 0) return 0;
  if (value >= WORLD_CHUNKS) return WORLD_CHUNKS - 1;
  return value;
}
