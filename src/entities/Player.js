import { PLAYER_SPEED } from '../config.js';
import { feetBlocked } from './collision.js';

const DIRS = ['down', 'up', 'side'];

export function createPlayerAnims(scene) {
  for (let i = 0; i < DIRS.length; i++) {
    const dir = DIRS[i];
    const walk = `player_walk_${dir}`;
    const idle = `player_idle_${dir}`;
    if (!scene.anims.exists(walk)) {
      scene.anims.create({
        key: walk,
        frames: scene.anims.generateFrameNames('main', {
          prefix: `player_walk_${dir}_`,
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!scene.anims.exists(idle)) {
      scene.anims.create({
        key: idle,
        frames: [{ key: 'main', frame: `player_idle_${dir}_0` }],
        frameRate: 1,
      });
    }
  }
}

export class Player {
  constructor(scene, x, y) {
    this.x = x;
    this.y = y;
    this.facing = 'down';
    this.flipX = false;
    this.moving = false;
    this.sprite = scene.add.sprite(x, y, 'main', 'player_idle_down_0');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(y);
  }

  update(dt, ax, ay, world) {
    const dist = PLAYER_SPEED * dt;
    this._move(world, ax * dist, 0);
    this._move(world, 0, ay * dist);
    this.moving = ax !== 0 || ay !== 0;
    if (this.moving) {
      if (Math.abs(ax) > Math.abs(ay)) {
        this.facing = 'side';
        this.flipX = ax < 0;
      } else if (ay < 0) {
        this.facing = 'up';
        this.flipX = false;
      } else {
        this.facing = 'down';
        this.flipX = false;
      }
    }
    this.syncSprite();
  }

  syncSprite() {
    const sprite = this.sprite;
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    if (sprite.x !== x || sprite.y !== y) sprite.setPosition(x, y);
    if (sprite.depth !== y) sprite.setDepth(y);
    if (sprite.flipX !== this.flipX) sprite.setFlipX(this.flipX);
    const key = this.moving ? `player_walk_${this.facing}` : `player_idle_${this.facing}`;
    const current = sprite.anims.currentAnim;
    if (!current || current.key !== key) sprite.play(key);
  }

  _move(world, dx, dy) {
    if (dx === 0 && dy === 0) return;
    const startX = this.x;
    const startY = this.y;
    this.x += dx;
    this.y += dy;
    if (!feetBlocked(world, this.x, this.y)) return;
    this.x = startX;
    this.y = startY;
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)));
    const sx = dx / steps;
    const sy = dy / steps;
    for (let i = 0; i < steps; i++) {
      this.x += sx;
      this.y += sy;
      if (feetBlocked(world, this.x, this.y)) {
        this.x -= sx;
        this.y -= sy;
        return;
      }
    }
  }
}
