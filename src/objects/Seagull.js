import Phaser from 'phaser';
import { GAME_WIDTH, GULLS } from '../config.js';
import { drawTimerRing } from '../utils/ring.js';

// A seagull that flies in, lands next to a sunbather and tries to steal
// their snack. Touch it (or use the whistle) to scare it away.
//
// state: 'incoming' -> 'stealing' -> 'leaving'
export default class Seagull extends Phaser.GameObjects.Sprite {
  constructor(scene, target) {
    // Start just off the left or right edge of the screen.
    const fromLeft = target.x > GAME_WIDTH / 2;
    super(scene, fromLeft ? -30 : GAME_WIDTH + 30, Phaser.Math.Between(40, 120), 'gull');
    scene.add.existing(this);
    this.setDepth(15).setFlipX(!fromLeft);

    this.target = target;
    this.landAt = new Phaser.Math.Vector2(target.x + (fromLeft ? -22 : 22), target.y - 6);
    this.state = 'incoming';
    this.timeLeft = GULLS.stealTime;
    this.flap = 0;
    this.ring = scene.add.graphics().setDepth(20);
    this.icon = scene.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: '11px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21);
  }

  // Runs every frame. Returns 'stole' on the frame the snack is taken.
  tick(dt) {
    this.flap += dt * 14;
    if (this.state !== 'stealing') this.setScale(1, 0.8 + Math.abs(Math.sin(this.flap)) * 0.3);

    if (this.state === 'incoming') {
      const step = GULLS.flySpeed * dt;
      const d = Phaser.Math.Distance.Between(this.x, this.y, this.landAt.x, this.landAt.y);
      if (d <= step) {
        this.setPosition(this.landAt.x, this.landAt.y).setScale(1);
        this.state = 'stealing';
      } else {
        const a = Phaser.Math.Angle.Between(this.x, this.y, this.landAt.x, this.landAt.y);
        this.x += Math.cos(a) * step;
        this.y += Math.sin(a) * step;
      }
    } else if (this.state === 'stealing') {
      this.timeLeft -= dt;
      // Pecking hop.
      this.y = this.landAt.y - Math.abs(Math.sin(this.flap * 0.6)) * 4;
      drawTimerRing(this.ring, this.x, this.y - 28, this.timeLeft / GULLS.stealTime, this.scene.time.now);
      this.icon.setText('GULL').setPosition(this.x, this.y - 28);
      if (this.timeLeft <= 0) {
        this.flyAway();
        return 'stole';
      }
    } else if (this.state === 'leaving') {
      this.y -= 220 * dt;
      this.x += (this.flipX ? 1 : -1) * 120 * dt;
      if (this.y < -40) this.destroy();
    }
    return null;
  }

  get canBeShooed() {
    return this.state === 'incoming' || this.state === 'stealing';
  }

  flyAway() {
    this.state = 'leaving';
    this.ring.clear();
    this.icon.setText('');
  }

  destroy(fromScene) {
    this.ring.destroy();
    this.icon.destroy();
    super.destroy(fromScene);
  }
}
