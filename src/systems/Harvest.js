import { config } from '../config.js';
import { BLOCK_EMPTY, BLOCK_STUMP } from '../config.js';
import { itemById, tiles } from '../world/TileRegistry.js';
import { pickBlock, reachDistance } from '../world/pick.js';

export function swingDamage(tileDef, inventory) {
  const hand = itemById.get('hand');
  const baseHand = hand && hand.harvestPower ? hand.harvestPower : 1;
  if (!tileDef || !tileDef.tool || !inventory) return baseHand;
  const slot = inventory.slots[inventory.selected];
  if (!slot) return baseHand;
  const item = itemById.get(slot.id);
  if (!item || item.type !== 'tool' || item.id !== tileDef.tool) return baseHand;
  const base = item.harvestPower || baseHand;
  return base * config.player.bestToolMultiplier;
}

export function forEachDrop(tileDef, rng, fn) {
  const drops = tileDef && tileDef.drops;
  if (!drops) return;
  for (let i = 0; i < drops.length; i++) {
    const drop = drops[i];
    const span = drop.max - drop.min;
    const count = span > 0 ? drop.min + Math.floor(rng() * (span + 1)) : drop.min;
    fn(drop.item, count);
  }
}

export class Harvest {
  constructor(scene, world, player, inventory, view) {
    this.scene = scene;
    this.world = world;
    this.player = player;
    this.inventory = inventory;
    this.view = view;
    this.cooldown = 0;
  }

  update(dt, primary, worldX, worldY, overUi) {
    if (this.cooldown > 0) this.cooldown -= dt;
    if (overUi || !primary || this.cooldown > 0) return;
    if (!this.trySwing(worldX, worldY)) return;
    this.cooldown = config.player.swingCooldown;
  }

  trySwing(worldX, worldY) {
    const hit = pickBlock(this.world, worldX, worldY);
    if (!hit) return false;
    const dist = reachDistance(this.player.x, this.player.y, hit.tx, hit.ty);
    if (dist > config.player.reach) return false;
    const def = tiles[hit.id];
    if (!def || !def.hp) return false;
    const hp = this.world.getHp(hit.tx, hit.ty);
    if (hp <= 0) return false;

    const next = hp - swingDamage(def, this.inventory);
    if (next <= 0) {
      if (def.id === 'tree') this.world.setBlock(hit.tx, hit.ty, BLOCK_STUMP, 0);
      else this.world.setBlock(hit.tx, hit.ty, BLOCK_EMPTY, 0);
      forEachDrop(def, this.world.rng, (itemId, count) => {
        this.inventory.add(itemId, count);
      });
    } else {
      this.world.setHp(hit.tx, hit.ty, next);
    }
    this.view.syncCell(hit.tx, hit.ty);
    this.view.flashCell(hit.tx, hit.ty);
    this.world.noiseAmount = config.noise.chop;
    this.scene.sound.play('sfx_chop', { volume: 0.55 });
    return true;
  }
}
