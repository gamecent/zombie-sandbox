import { CHUNK } from '../config.js';

const CELLS = CHUNK * CHUNK;

export class Chunk {
  constructor(cx, cy) {
    this.cx = cx;
    this.cy = cy;
    this.ground = new Uint16Array(CELLS);
    this.block = new Uint16Array(CELLS);
    this.hp = new Uint16Array(CELLS);
    this.groundDirty = true;
    this.blocksDirty = true;
    this.modified = false;
    /** 1 where a cell differs from generation. Allocated on the first edit. */
    this.edits = null;
  }

  markEdit(index) {
    this.modified = true;
    if (!this.edits) this.edits = new Uint8Array(CELLS);
    this.edits[index] = 1;
  }
}
