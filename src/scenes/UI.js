import Phaser from 'phaser';
import { TILE, ZOOM } from '../config.js';
import { describeClock } from '../util/clock.js';

const SLOTS = 9;

export class UI extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  create() {
    this.input.enabled = false;
    this.slots = new Array(SLOTS);
    this.icons = new Array(SLOTS);
    this.counts = new Array(SLOTS);
    for (let i = 0; i < SLOTS; i++) {
      this.slots[i] = this.add.image(0, 0, 'main', 'ui_hotbar_slot').setScale(ZOOM);
      this.icons[i] = this.add.image(0, 0, 'main', 'icon_wood').setScale(ZOOM).setVisible(false);
      this.counts[i] = this.add.text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(1, 1);
    }
    this.mode = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#b6ff9a',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 1);
    this.hint = this.add.text(0, 8, 'WASD 移动 · 左键砍伐 · B 建造 · 右键拆墙 · 1-9 快捷栏 · F3 调试', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#f3f6ea',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0);
    this.debugBg = this.add.rectangle(8, 28, 300, 128, 0x000000, 0.55).setOrigin(0, 0).setVisible(false);
    this.debugText = this.add.text(16, 36, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#e7f6ff',
      lineSpacing: 3,
    }).setVisible(false);
    this._sig = '';
    this._debugAt = 0;
    this._debugLine = '';
    this.layout(this.scale.width, this.scale.height);
    this.scale.on('resize', (size) => this.layout(size.width, size.height));
  }

  layout(width, height) {
    const slot = 20 * ZOOM;
    const gap = 2 * ZOOM;
    const total = SLOTS * slot + (SLOTS - 1) * gap;
    const start = Math.round((width - total) / 2);
    const y = Math.round(height - slot / 2 - 10);
    for (let i = 0; i < SLOTS; i++) {
      const x = start + slot / 2 + i * (slot + gap);
      this.slots[i].setPosition(x, y);
      this.icons[i].setPosition(x, y);
      this.counts[i].setPosition(x + slot / 2 - 4, y + slot / 2 - 3);
    }
    this.mode.setPosition(width / 2, y - slot / 2 - 4);
    this.hint.setPosition(width / 2, 8);
  }

  update() {
    const hud = this.registry.get('hud');
    if (!hud) return;
    this._syncHotbar(hud);
    const modeLabel = hud.build ? '建造模式' : '';
    if (this.mode.text !== modeLabel) this.mode.setText(modeLabel);
    const show = !!hud.debug;
    if (this.debugBg.visible !== show) {
      this.debugBg.setVisible(show);
      this.debugText.setVisible(show);
    }
    if (!show) return;
    const now = this.time.now;
    if (now - this._debugAt < 200 && this._debugLine) return;
    this._debugAt = now;
    const player = hud.player;
    const tx = Math.floor(player.x / TILE);
    const ty = Math.floor((player.y - 0.001) / TILE);
    const clock = describeClock(hud.elapsed);
    const line = [
      `FPS ${Math.round(hud.fps)}`,
      `种子 ${hud.seed}`,
      `坐标 ${tx},${ty}`,
      `区块 ${tx >> 5},${ty >> 5}`,
      clock.label,
      `哈希 ${hud.hash}`,
    ].join('\n');
    if (line !== this._debugLine) {
      this._debugLine = line;
      this.debugText.setText(line);
    }
  }

  _syncHotbar(hud) {
    const inventory = hud.inventory;
    let sig = String(inventory.selected);
    for (let i = 0; i < SLOTS; i++) {
      const slot = inventory.slots[i];
      sig += slot ? `|${slot.id}:${slot.count}` : '|';
    }
    if (sig === this._sig) return;
    this._sig = sig;
    const tex = this.textures.get('main');
    for (let i = 0; i < SLOTS; i++) {
      this.slots[i].setFrame(i === inventory.selected ? 'ui_hotbar_select' : 'ui_hotbar_slot');
      const slot = inventory.slots[i];
      if (!slot || slot.count <= 0) {
        this.icons[i].setVisible(false);
        this.counts[i].setText('');
        continue;
      }
      const frame = `icon_${slot.id}`;
      if (tex.has(frame)) {
        this.icons[i].setFrame(frame);
        this.icons[i].setVisible(true);
      } else {
        this.icons[i].setVisible(false);
      }
      const label = String(slot.count);
      if (this.counts[i].text !== label) this.counts[i].setText(label);
    }
  }
}
