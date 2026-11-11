import { BLOCK_STUMP, SPAWN_TILE_X, SPAWN_TILE_Y, TILE, WORLD_SIZE } from '../src/config.js';
import { feetBlocked } from '../src/entities/collision.js';
import { crackFrameFor } from '../src/entities/WallSprite.js';
import { forEachDrop, swingDamage } from '../src/systems/Harvest.js';
import { Inventory } from '../src/systems/Inventory.js';
import { applySave, deserialize, serialize } from '../src/systems/Save.js';
import { describeClock } from '../src/util/clock.js';
import { fnv1aBytes } from '../src/util/hash.js';
import { ID } from '../src/world/TileRegistry.js';
import { World, groundMask } from '../src/world/World.js';
import { reachDistance } from '../src/world/pick.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const fnvA = fnv1aBytes([97]);
assert(fnvA === 0xe40c292c, `FNV-1a("a") = ${fnvA.toString(16)}`);

const a = new World('12345');
const b = new World('12345');
const c = new World('999');
assert(a.hash === b.hash, `same seed hashes differ ${a.hash} vs ${b.hash}`);
assert(a.hash !== c.hash, 'different seeds produced the same hash');
assert(sameWorld(a, b), 'same seed worlds differ');
assert(!sameWorld(a, c), 'different seeds produced the same arrays');

const counts = countWorld(a);
console.log('seed 12345 hash', a.hash);
console.log('counts', counts);
assert(counts.grass > 0 && counts.dirt > 0 && counts.water > 0, 'missing a ground type');
assert(counts.tree > 100, `too few trees: ${counts.tree}`);
assert(counts.rock > 20, `too few rocks: ${counts.rock}`);
assert(counts.water < counts.grass, 'water covers more than grass');
assert(counts.spawnBlock === 0, 'spawn tile is not empty');
assert(!a.isSolid(SPAWN_TILE_X, SPAWN_TILE_Y), 'spawn is solid');

const px = SPAWN_TILE_X * TILE + TILE / 2;
const py = (SPAWN_TILE_Y + 1) * TILE;
assert(!feetBlocked(a, px, py), 'player starts inside a solid cell');
assert(Math.abs(reachDistance(px, py, SPAWN_TILE_X + 1, SPAWN_TILE_Y) - 1) < 1e-6, 'adjacent reach');
assert(reachDistance(px, py, SPAWN_TILE_X + 2, SPAWN_TILE_Y) > 1.25, 'two tiles should be out of reach');

let water = null;
for (let ty = 0; ty < WORLD_SIZE && !water; ty++) {
  for (let tx = 0; tx < WORLD_SIZE; tx++) {
    if (a.getGround(tx, ty) === ID.water) {
      water = { tx, ty };
      break;
    }
  }
}
assert(water, 'no water');
const wx = water.tx * TILE + TILE / 2;
const wy = (water.ty + 1) * TILE;
assert(feetBlocked(a, wx, wy), 'water does not block');

let tree = null;
for (let ty = 0; ty < WORLD_SIZE && !tree; ty++) {
  for (let tx = 0; tx < WORLD_SIZE; tx++) {
    if (a.getBlock(tx, ty) === ID.tree) {
      tree = { tx, ty };
      break;
    }
  }
}
assert(a.isSolid(tree.tx, tree.ty), 'tree is not solid');
assert(a.getHp(tree.tx, tree.ty) === 25, 'tree hp');
const hand = { slots: [null, null, null, null, null, null, null, null, null], selected: 0 };
assert(swingDamage({ tool: 'axe', hp: 25 }, hand) === 5, 'bare hand damage');
const wieldingHand = { slots: [{ id: 'hand', count: 1 }], selected: 0 };
assert(swingDamage({ tool: 'hand', hp: 1 }, wieldingHand) === 10, 'best-tool multiplier');

const rolls = [];
const rng = a.rng;
for (let i = 0; i < 200; i++) {
  forEachDrop({ drops: [{ item: 'wood', min: 3, max: 5 }] }, rng, (_item, n) => rolls.push(n));
}
assert(rolls.every((n) => n >= 3 && n <= 5), 'drop outside 3..5');
assert(rolls.includes(3) && rolls.includes(5), 'drop range did not hit both ends');

assert(crackFrameFor(100, 100) === null, 'full wall has no crack');
assert(crackFrameFor(75, 100) === null, '75% is not below the first stage');
assert(crackFrameFor(74, 100) === 'fx_crack_1', 'crack 1');
assert(crackFrameFor(50, 100) === 'fx_crack_1', '50% still crack 1');
assert(crackFrameFor(49, 100) === 'fx_crack_2', 'crack 2');
assert(crackFrameFor(25, 100) === 'fx_crack_2', '25% still crack 2');
assert(crackFrameFor(24, 100) === 'fx_crack_3', 'crack 3');

const edge = groundMask(a, 0, 0);
const id = a.getGround(0, 0);
let expect = 1 | 8;
if (a.getGround(1, 0) === id) expect |= 2;
if (a.getGround(0, 1) === id) expect |= 4;
assert(edge === expect, `corner mask ${edge} != ${expect}`);

a.setBlock(tree.tx, tree.ty, BLOCK_STUMP, 0);
assert(!a.isSolid(tree.tx, tree.ty), 'stump should not be solid');
const inv = new Inventory(9);
inv.add('wood', 7);
inv.selected = 2;
const player = { x: px, y: py, facing: 'side', flipX: true };
const saved = deserialize(JSON.parse(JSON.stringify(serialize({
  world: a,
  player,
  inventory: inv,
  seed: '12345',
}))));
const restored = new World('12345');
const inv2 = new Inventory(9);
const player2 = { x: 0, y: 0, facing: 'down', flipX: false };
applySave(restored, player2, inv2, saved);
assert(restored.getBlock(tree.tx, tree.ty) === BLOCK_STUMP, 'save did not restore the stump');
assert(restored.hash === a.hash, 'generated hash must ignore later edits');
assert(player2.x === px && player2.flipX === true && player2.facing === 'side', 'player save');
assert(inv2.countOf('wood') === 7 && inv2.selected === 2, 'inventory save');
assert(inv.remove('wood', 4) && inv.countOf('wood') === 3, 'wood cost');
assert(!inv.remove('stone', 1), 'cannot remove missing stone');

const clock0 = describeClock(0);
assert(clock0.dayIndex === 1 && clock0.phase === 'day', `clock start ${clock0.label}`);
assert(describeClock(160).phase === 'dusk', 'dusk');
assert(describeClock(200).phase === 'night', 'night');
assert(describeClock(280).dayIndex === 2 && describeClock(280).phase === 'day', 'next day');

const chunk = a.chunkAtTile(10, 10);
chunk.groundDirty = false;
a.setGround(10, 10, ID.dirt);
assert(a.chunkAtTile(10, 10).groundDirty, 'edited chunk should be dirty');
assert(a.chunkAtTile(9, 10).groundDirty, 'west neighbour chunk should be dirty');

console.log('clock', clock0.label);
console.log('ok');

function sameWorld(left, right) {
  for (let i = 0; i < left.chunks.length; i++) {
    const ca = left.chunks[i];
    const cb = right.chunks[i];
    for (let k = 0; k < ca.ground.length; k++) {
      if (ca.ground[k] !== cb.ground[k] || ca.block[k] !== cb.block[k] || ca.hp[k] !== cb.hp[k]) return false;
    }
  }
  return true;
}

function countWorld(world) {
  const counts = { grass: 0, dirt: 0, water: 0, tree: 0, rock: 0, spawnBlock: 0 };
  for (let ty = 0; ty < WORLD_SIZE; ty++) {
    for (let tx = 0; tx < WORLD_SIZE; tx++) {
      const ground = world.getGround(tx, ty);
      if (ground === ID.grass) counts.grass++;
      else if (ground === ID.dirt) counts.dirt++;
      else if (ground === ID.water) counts.water++;
      const block = world.getBlock(tx, ty);
      if (block === ID.tree) counts.tree++;
      else if (block === ID.rock) counts.rock++;
    }
  }
  counts.spawnBlock = world.getBlock(SPAWN_TILE_X, SPAWN_TILE_Y);
  return counts;
}
