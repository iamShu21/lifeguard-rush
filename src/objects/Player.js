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

    // Arrow keys plus WASD, and SHIFT to dash.
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,A,S,D');
    this.dashKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.facing = new Phaser.Math.Vector2(0, -1); // last direction moved
    this.dashTimer = 0;      // > 0 while dashing
    this.dashCooldown = 0;   // > 0 while the dash is recharging
    this.trailTimer = 0;
  }

  // True when the lifeguard is in the water (above the shoreline).
  get inWater() {
    return this.y < BEACH.shoreY;
  }

  get dashReady() {
    return this.dashCooldown <= 0;
  }

  // Called every frame by the scene. dt is in seconds.
  update(dt) {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    // Build a direction from the keys held, e.g. right + up = (1, -1).
    // normalize() stops diagonal movement from being faster than straight.
    const dir = new Phaser.Math.Vector2(
      (right ? 1 : 0) - (left ? 1 : 0),
      (down ? 1 : 0) - (up ? 1 : 0),
    ).normalize();
    if (dir.lengthSq() > 0) this.facing.copy(dir);

    this.dashCooldown -= dt;
    if (Phaser.Input.Keyboard.JustDown(this.dashKey) && this.dashReady) {
      this.dashTimer = PLAYER.dashTime;
      this.dashCooldown = PLAYER.dashCooldown;
    }

    if (this.dashTimer > 0) {
      // Dashing: shoot forward, a bit slower in water.
      this.dashTimer -= dt;
      const speed = PLAYER.dashSpeed * (this.inWater ? 0.6 : 1);
      this.setVelocity(this.facing.x * speed, this.facing.y * speed);
      this.leaveTrail(dt);
      return;
    }

    const speed = this.inWater ? PLAYER.waterSpeed : PLAYER.sandSpeed;
    this.setVelocity(dir.x * speed, dir.y * speed);
  }

  // Fading copies of the lifeguard left behind during a dash.
  leaveTrail(dt) {
    this.trailTimer -= dt;
    if (this.trailTimer > 0) return;
    this.trailTimer = 0.03;
    const ghost = this.scene.add.image(this.x, this.y, 'player').setAlpha(0.5).setDepth(this.depth - 1);
    this.scene.tweens.add({
      targets: ghost, alpha: 0, scale: 0.6, duration: 220, onComplete: () => ghost.destroy(),
    });
  }
}
