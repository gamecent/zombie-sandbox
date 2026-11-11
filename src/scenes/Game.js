import Phaser from 'phaser';
import {
  SPAWN_TILE_X,
  SPAWN_TILE_Y,
  TILE,
  WORLD_PIXELS,
  ZOOM,
  config,
} from '../config.js';
import { chooseSeed } from '../util/seed.js';
import { World } from '../world/World.js';
import { ChunkView } from '../world/ChunkRenderer.js';
import { Player, createPlayerAnims } from '../entities/Player.js';
import { Input } from '../systems/Input.js';
import { Inventory } from '../systems/Inventory.js';
import { Harvest } from '../systems/Harvest.js';
import { Build } from '../systems/Build.js';
import { Silhouette } from '../systems/Silhouette.js';

export class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const seed = chooseSeed();
    this.world = new World(seed);
    this.inventory = new Inventory(config.player.hotbarSlots);
    createPlayerAnims(this);
    const spawnX = SPAWN_TILE_X * TILE + (TILE >> 1);
    const spawnY = (SPAWN_TILE_Y + 1) * TILE;
    this.player = new Player(this, spawnX, spawnY);
    this.inputSys = new Input(this);
    this.view = new ChunkView(this, this.world);
    this.harvest = new Harvest(this, this.world, this.player, this.inventory, this.view);
    this.build = new Build(this, this.world, this.player, this.inventory, this.view);
    this.silhouette = new Silhouette(this);

    const camera = this.cameras.main;
    camera.setZoom(ZOOM);
    camera.roundPixels = true;
    camera.setBounds(0, 0, WORLD_PIXELS, WORLD_PIXELS);
    camera.startFollow(this.player.sprite, true, 1, 1);
    camera.setBackgroundColor('#1d3a22');

    this.elapsed = 0;
    this.state = {
      seed,
      hash: this.world.hash,
      debug: false,
      build: false,
      inventory: this.inventory,
      player: this.player,
      world: this.world,
      elapsed: 0,
      fps: 0,
    };
    this.registry.set('hud', this.state);
    globalThis.__ZOMBIE__ = {
      state: this.state,
      world: this.world,
      player: this.player,
      inventory: this.inventory,
      build: this.build,
      harvest: this.harvest,
      view: this.view,
      silhouette: this.silhouette,
    };

    this.scale.on('resize', (size) => {
      this.cameras.main.setSize(size.width, size.height);
    });
    this.scene.launch('UI');
  }

  update(_time, delta) {
    const dt = delta > 50 ? 0.05 : delta / 1000;
    this.elapsed += dt;
    const input = this.inputSys;
    input.poll();
    if (input.debugPressed) this.state.debug = !this.state.debug;
    if (input.digit >= 0) this.inventory.selected = input.digit;
    if (input.buildPressed) this.state.build = this.build.toggle();

    this.player.update(dt, input.ax, input.ay, this.world);

    const point = input.worldAt(this.cameras.main);
    const overUi = input.pointer.y >= this.scale.height - (20 * ZOOM + 18);
    if (this.build.enabled) {
      this.build.update(dt, input.primary, input.secondaryJust, point.x, point.y, overUi);
    } else {
      this.harvest.update(dt, input.primary, point.x, point.y, overUi);
    }

    const camera = this.cameras.main;
    this.view.update(camera, this.player.sprite.x, this.player.sprite.y);
    this.silhouette.update(this.player, this.view);

    this.state.elapsed = this.elapsed;
    this.state.fps = this.game.loop.actualFps;
    this.state.build = this.build.enabled;
  }
}
