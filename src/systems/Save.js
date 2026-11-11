/**
 * Save format version 1.
 * IndexedDB persistence is a later milestone; this module only defines the
 * document and can round-trip it in memory.
 *
 * {
 *   version: 1,
 *   seed: string,
 *   chunks: [{ cx, cy, cells: [{ i, ground, block, hp }] }],
 *   player: { x, y, facing, flipX },
 *   inventory: { selected, slots: [ { id, count } | null ] }
 * }
 *
 * `chunks` lists only cells edited after generation (a diff). Restore by
 * generating `seed` again, then applying the diffs on top.
 * Cell index `i` is `(localY << 5) + localX` inside a 32×32 chunk.
 */
export const SAVE_VERSION = 1;

export function serialize({ world, player, inventory, seed }) {
  const chunks = [];
  const list = world.chunks;
  for (let n = 0; n < list.length; n++) {
    const chunk = list[n];
    if (!chunk.modified || !chunk.edits) continue;
    const cells = [];
    const edits = chunk.edits;
    for (let i = 0; i < edits.length; i++) {
      if (!edits[i]) continue;
      cells.push({
        i,
        ground: chunk.ground[i],
        block: chunk.block[i],
        hp: chunk.hp[i],
      });
    }
    chunks.push({ cx: chunk.cx, cy: chunk.cy, cells });
  }
  const slots = new Array(inventory.size);
  for (let i = 0; i < inventory.size; i++) {
    const slot = inventory.slots[i];
    slots[i] = slot ? { id: slot.id, count: slot.count } : null;
  }
  return {
    version: SAVE_VERSION,
    seed: String(seed),
    chunks,
    player: {
      x: player.x,
      y: player.y,
      facing: player.facing,
      flipX: !!player.flipX,
    },
    inventory: {
      selected: inventory.selected,
      slots,
    },
  };
}

export function deserialize(data) {
  if (!data || typeof data !== 'object') throw new Error('存档为空');
  if (data.version !== SAVE_VERSION) throw new Error(`不支持的存档版本: ${data.version}`);
  if (data.seed === undefined || data.seed === null) throw new Error('存档缺少种子');
  const srcChunks = Array.isArray(data.chunks) ? data.chunks : [];
  const chunks = new Array(srcChunks.length);
  for (let c = 0; c < srcChunks.length; c++) {
    const chunk = srcChunks[c];
    const raw = Array.isArray(chunk.cells) ? chunk.cells : [];
    const cells = new Array(raw.length);
    for (let k = 0; k < raw.length; k++) {
      const cell = raw[k];
      cells[k] = {
        i: cell.i | 0,
        ground: cell.ground | 0,
        block: cell.block | 0,
        hp: cell.hp | 0,
      };
    }
    chunks[c] = { cx: chunk.cx | 0, cy: chunk.cy | 0, cells };
  }
  const inv = data.inventory || {};
  const rawSlots = Array.isArray(inv.slots) ? inv.slots : [];
  const slots = new Array(rawSlots.length);
  for (let i = 0; i < rawSlots.length; i++) {
    const slot = rawSlots[i];
    slots[i] = slot ? { id: String(slot.id), count: slot.count | 0 } : null;
  }
  const player = data.player || {};
  return {
    version: SAVE_VERSION,
    seed: String(data.seed),
    chunks,
    player: {
      x: Number(player.x) || 0,
      y: Number(player.y) || 0,
      facing: player.facing || 'down',
      flipX: !!player.flipX,
    },
    inventory: {
      selected: inv.selected | 0,
      slots,
    },
  };
}

/** Apply a deserialized save onto a world generated from the same seed. */
export function applySave(world, player, inventory, saved) {
  const data = saved.version === SAVE_VERSION && saved.chunks ? saved : deserialize(saved);
  for (let i = 0; i < data.chunks.length; i++) {
    const chunk = data.chunks[i];
    world.applyChunkDiff(chunk.cx, chunk.cy, chunk.cells);
  }
  player.x = data.player.x;
  player.y = data.player.y;
  player.facing = data.player.facing;
  player.flipX = data.player.flipX;
  inventory.selected = data.inventory.selected;
  const slots = data.inventory.slots;
  for (let i = 0; i < inventory.slots.length; i++) {
    const slot = slots[i];
    inventory.slots[i] = slot ? { id: slot.id, count: slot.count } : null;
  }
  if (player.syncSprite) player.syncSprite();
}
