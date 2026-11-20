import Phaser from 'phaser';
import { PLAYER, BEACH } from '../config.js';

// The lifeguard the player controls.
// It is an Arcade Physics sprite, so Phaser handles movement and keeps it
// inside the screen for us. We only set its velocity each frame.
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);          // show it on screen
    scene.physics.add.existing(this);  // give it a physics body
    this.setCollideWorldBounds(true);

    // Arrow keys plus WASD.
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,A,S,D');
  }

  // True when the lifeguard is in the water (above the shoreline).
  get inWater() {
    return this.y < BEACH.shoreY;
  }

  // Called every frame by the scene.
  update() {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    // Build a direction from the keys held, e.g. right + up = (1, -1).
    const dir = new Phaser.Math.Vector2(
      (right ? 1 : 0) - (left ? 1 : 0),
      (down ? 1 : 0) - (up ? 1 : 0),
    );

    // normalize() stops diagonal movement from being faster than straight.
    const speed = this.inWater ? PLAYER.waterSpeed : PLAYER.sandSpeed;
    dir.normalize().scale(speed);
    this.setVelocity(dir.x, dir.y);
  }
}
