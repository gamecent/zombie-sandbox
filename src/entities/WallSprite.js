import { TILE, config } from '../config.js';
import { ID } from '../world/TileRegistry.js';

/**
 * M1 walls do not autotile, even though wall_wood.autotile is true.
 * Later milestones can branch here and composite wall_wood_top / wall_wood_front.
 */
export function resolveWallFrame(_tx, _ty, _world) {
  return 'wall_wood';
}

/** `fx_crack_1..3` once hp drops below 75% / 50% / 25% of max. */
export function crackFrameFor(hp, maxHp) {
  if (!(maxHp > 0)) return null;
  const stages = config.building.crackStages;
  const ratio = hp / maxHp;
  let frame = null;
  for (let i = 0; i < stages.length; i++) {
    if (ratio < stages[i]) frame = `fx_crack_${i + 1}`;
  }
  return frame;
}

export function blockFrame(blockId, tx, ty, world) {
  if (blockId === ID.wall) return resolveWallFrame(tx, ty, world);
  if (blockId === ID.tree) return 'tree';
  if (blockId === ID.rock) return 'rock';
  return 'tree_stump';
}

/** Origin (0.5, 1) on the bottom centre of the tile. Depth is the feet y. */
export function placeFeetSprite(sprite, tx, ty, frame) {
  const x = tx * TILE + (TILE >> 1);
  const y = (ty + 1) * TILE;
  sprite.setTexture('main', frame);
  sprite.setOrigin(0.5, 1);
  sprite.setPosition(x, y);
  sprite.setDepth(y);
  return y;
}
