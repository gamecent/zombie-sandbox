import Phaser from 'phaser';

const DIGITS = [
  Phaser.Input.Keyboard.KeyCodes.ONE,
  Phaser.Input.Keyboard.KeyCodes.TWO,
  Phaser.Input.Keyboard.KeyCodes.THREE,
  Phaser.Input.Keyboard.KeyCodes.FOUR,
  Phaser.Input.Keyboard.KeyCodes.FIVE,
  Phaser.Input.Keyboard.KeyCodes.SIX,
  Phaser.Input.Keyboard.KeyCodes.SEVEN,
  Phaser.Input.Keyboard.KeyCodes.EIGHT,
  Phaser.Input.Keyboard.KeyCodes.NINE,
];

const NUMPAD = [
  Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE,
  Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO,
  Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE,
  Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR,
  Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE,
  Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX,
  Phaser.Input.Keyboard.KeyCodes.NUMPAD_SEVEN,
  Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT,
  Phaser.Input.Keyboard.KeyCodes.NUMPAD_NINE,
];

export class Input {
  constructor(scene) {
    const keyboard = scene.input.keyboard;
    this.keys = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up2: Phaser.Input.Keyboard.KeyCodes.UP,
      down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      build: Phaser.Input.Keyboard.KeyCodes.B,
      debug: Phaser.Input.Keyboard.KeyCodes.F3,
    });
    this.digitKeys = new Array(9);
    this.numpadKeys = new Array(9);
    for (let i = 0; i < 9; i++) {
      this.digitKeys[i] = keyboard.addKey(DIGITS[i]);
      this.numpadKeys[i] = keyboard.addKey(NUMPAD[i]);
    }
    keyboard.addCapture([
      'W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'B',
      'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
    ]);
    scene.input.mouse.disableContextMenu();
    this.pointer = scene.input.activePointer;
    this.ax = 0;
    this.ay = 0;
    this.buildPressed = false;
    this.debugPressed = false;
    this.digit = -1;
    this.primary = false;
    this.secondaryJust = false;
    this._prevSecondary = false;
    this.worldPoint = { x: 0, y: 0 };
  }

  poll() {
    const keys = this.keys;
    let x = 0;
    let y = 0;
    if (keys.left.isDown || keys.left2.isDown) x -= 1;
    if (keys.right.isDown || keys.right2.isDown) x += 1;
    if (keys.up.isDown || keys.up2.isDown) y -= 1;
    if (keys.down.isDown || keys.down2.isDown) y += 1;
    if (x !== 0 && y !== 0) {
      x *= 0.7071067811865476;
      y *= 0.7071067811865476;
    }
    this.ax = x;
    this.ay = y;
    this.buildPressed = Phaser.Input.Keyboard.JustDown(keys.build);
    this.debugPressed = Phaser.Input.Keyboard.JustDown(keys.debug);
    this.digit = -1;
    for (let i = 0; i < 9; i++) {
      if (Phaser.Input.Keyboard.JustDown(this.digitKeys[i]) || Phaser.Input.Keyboard.JustDown(this.numpadKeys[i])) {
        this.digit = i;
      }
    }
    const pointer = this.pointer;
    this.primary = pointer.leftButtonDown();
    const secondary = pointer.rightButtonDown();
    this.secondaryJust = secondary && !this._prevSecondary;
    this._prevSecondary = secondary;
  }

  worldAt(camera) {
    camera.getWorldPoint(this.pointer.x, this.pointer.y, this.worldPoint);
    return this.worldPoint;
  }
}
