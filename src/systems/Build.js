import { BLOCK_EMPTY, TILE, WORLD_SIZE, config } from '../config.js';
import { ID, getTile } from '../world/TileRegistry.js';
import { pickBlock, reachDistance } from '../world/pick.js';
import { feetOverlapTile } from '../entities/collision.js';
import { forEachDrop } from './Harvest.js';

const GRID_RADIUS = 4;

export class Build {
  constructor(scene, world, player, inventory, view) {
    this.scene = scene;
    this.world = world;
    this.player = player;
    this.inventory = inventory;
    this.view = view;
    this.enabled = false;
    this.progress = 0;
    this.cellX = -9999;
    this.cellY = -9999;
    this.ghost = scene.add.sprite(0, 0, 'main', 'wall_wood');
    this.ghost.setOrigin(0.5, 1);
    this.ghost.setAlpha(0.5);
    this.ghost.setVisible(false);
    this.marker = scene.add.image(0, 0, 'main', 'ui_build_ok');
    this.marker.setOrigin(0.5, 0.5);
    this.marker.setDepth(1);
    this.marker.setVisible(false);
    this.grid = scene.add.graphics();
    this.grid.setDepth(2);
    this._gridX = -9999;
    this._gridY = -9999;
    this.wall = getTile('wall_wood');
  }

  toggle() {
    this.enabled = !this.enabled;
    this.progress = 0;
    if (!this.enabled) this.hide();
    return this.enabled;
  }

  hide() {
    this.ghost.setVisible(false);
    this.marker.setVisible(false);
    this.grid.clear();
    this._gridX = -9999;
    this.progress = 0;
  }

  update(dt, primary, secondaryJust, worldX, worldY, overUi) {
    if (!this.enabled) return;
    const tx = Math.floor(worldX / TILE);
    const ty = Math.floor(worldY / TILE);
    const inside = this.world.inBounds(tx, ty);
    if (!inside || overUi) {
      this.hide();
      return;
    }
    const ok = this.canPlace(tx, ty);
    this._showGhost(tx, ty, ok);
    if (primary && ok) {
      if (tx !== this.cellX || ty !== this.cellY) {
        this.progress = 0;
        this.cellX = tx;
        this.cellY = ty;
      }
      this.progress += dt;
      const limit = config.building.buildTime;
      if (this.progress >= limit) {
        this.place(tx, ty);
        this.progress = 0;
      }
      const t = this.progress / limit;
      this.ghost.setAlpha(0.5 + 0.35 * t);
    } else {
      this.progress = 0;
      this.cellX = tx;
      this.cellY = ty;
      this.ghost.setAlpha(0.5);
    }
    if (secondaryJust) this.tryRemove(worldX, worldY);
  }

  canPlace(tx, ty) {
    if (!this.world.inBounds(tx, ty)) return false;
    if (reachDistance(this.player.x, this.player.y, tx, ty) > config.player.reach) return false;
    if (this.world.getBlock(tx, ty) !== BLOCK_EMPTY) return false;
    if (this.world.isSolid(tx, ty)) return false;
    if (feetOverlapTile(this.player.x, this.player.y, tx, ty)) return false;
    return this.inventory.canAfford(this.wall.buildCost);
  }

  place(tx, ty) {
    if (!this.canPlace(tx, ty)) return false;
    if (!this.inventory.pay(this.wall.buildCost)) return false;
    this.world.setBlock(tx, ty, this.wall.numId, this.wall.hp);
    this.view.syncCell(tx, ty);
    this.world.noiseAmount = config.noise.build;
    this.scene.sound.play('sfx_place', { volume: 0.6 });
    return true;
  }

  tryRemove(worldX, worldY) {
    const hit = pickBlock(this.world, worldX, worldY);
    if (!hit || hit.id !== ID.wall) return false;
    if (reachDistance(this.player.x, this.player.y, hit.tx, hit.ty) > config.player.reach) return false;
    const def = getTile('wall_wood');
    this.world.setBlock(hit.tx, hit.ty, BLOCK_EMPTY, 0);
    this.view.syncCell(hit.tx, hit.ty);
    forEachDrop(def, this.world.rng, (itemId, count) => {
      this.inventory.add(itemId, count);
    });
    this.scene.sound.play('sfx_chop', { volume: 0.45 });
    return true;
  }

  _showGhost(tx, ty, ok) {
    const x = tx * TILE + (TILE >> 1);
    const y = (ty + 1) * TILE;
    this.ghost.setPosition(x, y);
    this.ghost.setDepth(y + 0.2);
    this.ghost.setTint(ok ? 0x55ff55 : 0xff5555);
    this.ghost.setVisible(true);
    this.marker.setPosition(tx * TILE + (TILE >> 1), ty * TILE + (TILE >> 1));
    this.marker.setFrame(ok ? 'ui_build_ok' : 'ui_build_bad');
    this.marker.setVisible(true);
    if (this._gridX === tx && this._gridY === ty) return;
    this._gridX = tx;
    this._gridY = ty;
    const g = this.grid;
    g.clear();
    g.lineStyle(1, 0xffffff, 0.28);
    const size = WORLD_SIZE;
    for (let cy = ty - GRID_RADIUS; cy <= ty + GRID_RADIUS; cy++) {
      if (cy < 0 || cy >= size) continue;
      for (let cx = tx - GRID_RADIUS; cx <= tx + GRID_RADIUS; cx++) {
        if (cx < 0 || cx >= size) continue;
        g.strokeRect(cx * TILE + 0.5, cy * TILE + 0.5, TILE - 1, TILE - 1);
      }
    }
  }
}
