import { TILE } from '../config.js';
import { ID } from '../world/TileRegistry.js';

const FRAME_W = 16;
const FRAME_H = 24;

/**
 * Draws the player silhouette above world sprites, cropped to the overlap
 * with each wall or tree to the south. Silhouette frames are authored facing
 * right; flipX mirrors them. Phaser also flips crop UVs when flipX is set,
 * which would mirror the texels a second time, so those UVs are pinned back.
 */
export class Silhouette {
  constructor(scene) {
    this.scene = scene;
    this.sprites = [];
    this.tex = scene.textures.get('main');
  }

  update(player, view) {
    const body = player.sprite;
    const px = body.x;
    const py = body.y;
    const left = px - (FRAME_W >> 1);
    const top = py - FRAME_H;
    const right = px + (FRAME_W >> 1);
    const tx = Math.floor(player.x / TILE);
    const ty = Math.floor((player.y - 0.001) / TILE);
    const sourceName = body.frame.name;
    const silName = `player_silhouette_${sourceName.slice(7)}`;
    const fallback = !this.tex.has(silName);
    const frameName = fallback ? sourceName : silName;
    let used = 0;

    for (let y = ty; y <= ty + 2; y++) {
      for (let x = tx - 1; x <= tx + 1; x++) {
        const record = view.recordAt(x, y);
        if (!record) continue;
        const id = record.blockId;
        if (id !== ID.tree && id !== ID.wall) continue;
        const occluder = record.main;
        if (!(py < occluder.y)) continue;
        const height = id === ID.tree ? 32 : 24;
        const ol = occluder.x - 8;
        const oright = occluder.x + 8;
        const otop = occluder.y - height;
        const ix0 = left > ol ? left : ol;
        const iy0 = top > otop ? top : otop;
        const ix1 = right < oright ? right : oright;
        const iy1 = py < occluder.y ? py : occluder.y;
        if (ix1 - ix0 < 0.5 || iy1 - iy0 < 0.5) continue;
        const sil = this._sprite(used++);
        paint(
          sil,
          frameName,
          player.flipX,
          px,
          py,
          Math.floor(ix0 - left),
          Math.floor(iy0 - top),
          Math.ceil(ix1 - left),
          Math.ceil(iy1 - top),
          fallback,
        );
      }
    }

    for (let i = used; i < this.sprites.length; i++) this.sprites[i].setVisible(false);
  }

  _sprite(index) {
    let sprite = this.sprites[index];
    if (!sprite) {
      sprite = this.scene.add.sprite(0, 0, 'main', 'player_silhouette_idle_down_0');
      sprite.setOrigin(0.5, 1);
      sprite.setDepth(100000);
      this.sprites[index] = sprite;
    }
    return sprite;
  }
}

function paint(sprite, frameName, flipX, px, py, vLeft, vTop, vRight, vBottom, fallback) {
  if (sprite.frame.name !== frameName) sprite.setTexture('main', frameName);
  sprite.setOrigin(0.5, 1);
  sprite.setPosition(px, py);
  sprite.setFlipX(flipX);
  sprite.setDepth(100000);
  if (fallback) {
    sprite.setTintFill(0x7cc8ff);
    sprite.setAlpha(0.63);
  } else if (sprite.alpha !== 1) {
    sprite.clearTint();
    sprite.setAlpha(1);
  }
  let x = vLeft;
  let y = vTop;
  let w = vRight - vLeft;
  let h = vBottom - vTop;
  if (x < 0) {
    w += x;
    x = 0;
  }
  if (y < 0) {
    h += y;
    y = 0;
  }
  if (x + w > FRAME_W) w = FRAME_W - x;
  if (y + h > FRAME_H) h = FRAME_H - y;
  if (w <= 0 || h <= 0) {
    sprite.setVisible(false);
    return;
  }
  const cropX = flipX ? FRAME_W - x - w : x;
  sprite.setCrop(cropX, y, w, h);
  if (flipX) pinUnflippedUVs(sprite, cropX, y, w, h);
  sprite.setVisible(true);
}

function pinUnflippedUVs(sprite, x, y, w, h) {
  const frame = sprite.frame;
  const crop = sprite._crop;
  const tw = frame.source.width;
  const th = frame.source.height;
  const ox = frame.cutX + x;
  const oy = frame.cutY + y;
  crop.u0 = ox / tw;
  crop.v0 = oy / th;
  crop.u1 = (ox + w) / tw;
  crop.v1 = (oy + h) / th;
  crop.flipX = sprite.flipX;
  crop.flipY = sprite.flipY;
}
