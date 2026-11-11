import Phaser from 'phaser';

export class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const width = this.scale.width;
    const height = this.scale.height;
    const bar = this.add.graphics();
    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(0x1c1c1c, 1);
      bar.fillRect(width / 2 - 80, height / 2 - 6, 160, 12);
      bar.fillStyle(0x7cc8ff, 1);
      bar.fillRect(width / 2 - 80, height / 2 - 6, 160 * value, 12);
    });

    const base = import.meta.env.BASE_URL;
    this.load.atlas('main', `${base}assets/atlas/main.png`, `${base}assets/atlas/main.json`);
    // M1 plays chop/place. The rest are preloaded for later milestones.
    const sounds = [
      'sfx_chop',
      'sfx_place',
      'sfx_door',
      'sfx_hit',
      'sfx_pickup',
      'sfx_step_dirt_1',
      'sfx_step_dirt_2',
      'sfx_step_grass_1',
      'sfx_step_grass_2',
      'sfx_swing',
      'sfx_zombie_death',
      'sfx_zombie_groan_1',
      'sfx_zombie_groan_2',
      'sfx_zombie_groan_3',
      'sfx_zombie_hit',
    ];
    for (let i = 0; i < sounds.length; i++) {
      const name = sounds[i];
      this.load.audio(name, [`${base}assets/audio/${name}.ogg`, `${base}assets/audio/${name}.mp3`]);
    }
  }

  create() {
    // Atlas JSON pivots are packer defaults. Gameplay anchors are setOrigin.
    const tex = this.textures.get('main');
    const names = tex.getFrameNames();
    for (let i = 0; i < names.length; i++) tex.get(names[i]).customPivot = false;
    this.scene.start('Game');
  }
}
