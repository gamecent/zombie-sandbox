import Phaser from 'phaser';
import { Boot } from './scenes/Boot.js';
import { Preload } from './scenes/Preload.js';
import { Game } from './scenes/Game.js';
import { UI } from './scenes/UI.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#142016',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  banner: false,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    powerPreference: 'high-performance',
  },
  fps: { target: 60 },
  scene: [Boot, Preload, Game, UI],
});

export default game;
