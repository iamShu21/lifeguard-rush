import Phaser from 'phaser';
import { BEACH, EVENTS, COLORS } from '../config.js';

// A person at the beach. Most of the time they are fine. When the scene
// gives them a problem (startProblem), a warning marker appears above them
// with a ring that fills up. If the ring fills before the lifeguard helps,
// the problem "expires" and the beach loses Fun.
//
// kind: 'sunbather' (lies on the sand) or 'swimmer' (in the water)
export default class Beachgoer extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, kind) {
    const texture = kind === 'swimmer'
      ? 'swimmer'
      : `sunbather${Phaser.Math.Between(0, COLORS.towel.length - 1)}`;
    super(scene, x, y, texture);
    scene.add.existing(this);

    this.kind = kind;
    this.home = new Phaser.Math.Vector2(x, y); // where they go back to
    this.problem = null;    // { type, timeLeft, total } while in trouble
    this.carried = false;   // true while the lifeguard is carrying them
    this.wobble = Math.random() * Math.PI * 2; // makes swimmers bob

    // The warning marker: a ring timer plus a symbol, drawn above the person.
    this.ring = scene.add.graphics().setDepth(20);
    this.icon = scene.add.text(x, y, '', {
      fontFamily: 'monospace', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21);
  }

  get inTrouble() {
    return this.problem !== null;
  }

  // type: 'sunburn' or 'drift'
  startProblem(type) {
    const time = EVENTS[type].time;
    this.problem = { type, timeLeft: time, total: time };
    this.icon.setText(type === 'sunburn' ? 'SUN' : 'HELP');
    if (type === 'sunburn') this.setTint(COLORS.burnt);
  }

  clearProblem() {
    this.problem = null;
    this.clearTint();
    this.ring.clear();
    this.icon.setText('');
  }

  // Runs every frame. dt is in seconds.
  // Returns 'expired' on the frame the problem runs out of time.
  tick(dt) {
    if (this.kind === 'swimmer' && !this.carried) {
      this.wobble += dt * 3;
      if (this.problem?.type === 'drift') {
        // Drifting swimmers float out toward the deep water.
        this.y = Math.max(40, this.y - EVENTS.drift.driftSpeed * dt);
      } else {
        this.y = this.home.y + Math.sin(this.wobble) * 3; // gentle bobbing
      }
    }

    if (!this.problem) return null;

    // While carried, the rescue is underway: pause the timer, hide the marker.
    if (this.carried) {
      this.ring.clear();
      this.icon.setText('');
      return null;
    }
    this.problem.timeLeft -= dt;
    this.icon.setText(this.problem.type === 'sunburn' ? 'SUN' : 'HELP');
    this.drawMarker();
    if (this.problem.timeLeft <= 0) return 'expired';
    return null;
  }

  drawMarker() {
    const x = this.x;
    const y = this.y - 34;
    const left = this.problem.timeLeft / this.problem.total; // 1 = full time left
    const danger = left < 0.35;

    this.ring.clear();
    this.ring.fillStyle(danger ? 0xd62828 : 0x222222, 0.85).fillCircle(x, y, 20);
    // The ring empties as time runs out.
    this.ring.lineStyle(4, danger ? 0xffd23f : 0x7ee081);
    this.ring.beginPath();
    this.ring.arc(x, y, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left, false);
    this.ring.strokePath();

    this.icon.setPosition(x, y).setFontSize(this.problem.type === 'drift' ? 11 : 12);
  }

  // Put a rescued swimmer back to being a normal swimmer at their spot.
  resetHome() {
    this.carried = false;
    this.setPosition(this.home.x, this.home.y);
    this.setAlpha(0);
    this.scene.tweens.add({ targets: this, alpha: 1, duration: 600 });
  }

  // Is this person in the safe swimming area or beyond the buoys?
  get pastBuoys() {
    return this.y < BEACH.buoyLineY;
  }

  destroy(fromScene) {
    this.ring.destroy();
    this.icon.destroy();
    super.destroy(fromScene);
  }
}
