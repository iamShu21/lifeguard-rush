import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, BEACH, COLORS, DAY, EVENTS } from '../config.js';
import Player from '../objects/Player.js';
import Beachgoer from '../objects/Beachgoer.js';

// Where people sit or swim at the start of the day.
const SUNBATHER_SPOTS = [
  [120, 300], [260, 350], [420, 290], [560, 380], [700, 310], [840, 360],
  [180, 450], [480, 470], [780, 460],
];
const SWIMMER_SPOTS = [[150, 175], [330, 160], [520, 185], [690, 165], [860, 180]];

// The main gameplay scene: one summer day at the beach.
export default class BeachScene extends Phaser.Scene {
  constructor() {
    super('Beach');
  }

  create() {
    this.drawBeach();

    // Game state for this day.
    this.fun = DAY.startFun;
    this.score = 0;
    this.timeLeft = DAY.length;
    this.spawnTimer = 2;     // first problem appears after 2 seconds
    this.holdTime = 0;       // how long SPACE has been held on a rescue
    this.carrying = null;    // the swimmer being carried, if any
    this.over = false;
    this.stats = { fixed: 0, missed: 0 };

    this.people = [
      ...SUNBATHER_SPOTS.map(([x, y]) => new Beachgoer(this, x, y, 'sunbather')),
      ...SWIMMER_SPOTS.map(([x, y]) => new Beachgoer(this, x, y, 'swimmer')),
    ];

    this.player = new Player(this, GAME_WIDTH / 2, BEACH.shoreY + 30);
    this.player.setDepth(10);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.createHud();
  }

  update(time, deltaMs) {
    if (this.over) return;
    const dt = deltaMs / 1000;

    this.player.update();
    this.updateClock(dt);
    this.updateSpawning(dt);
    this.updatePeople(dt);
    this.updateHelping(dt);
    this.updateHud();
  }

  // ---------------------------------------------------------------- clock

  updateClock(dt) {
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) this.endDay(true);
  }

  // ------------------------------------------------------------- spawning

  // Every few seconds, give a random person who is fine a new problem.
  updateSpawning(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = EVENTS.spawnEvery;

    const active = this.people.filter((p) => p.inTrouble).length;
    if (active >= EVENTS.maxActive) return;

    const calm = this.people.filter((p) => !p.inTrouble && !p.carried && p.visible && p.alpha === 1);
    if (calm.length === 0) return;
    const person = Phaser.Utils.Array.GetRandom(calm);
    person.startProblem(person.kind === 'swimmer' ? 'drift' : 'sunburn');
  }

  // --------------------------------------------------------------- people

  updatePeople(dt) {
    for (const person of this.people) {
      if (person.tick(dt) === 'expired') this.missProblem(person);
    }
    // A carried swimmer is held just above the lifeguard.
    if (this.carrying) this.carrying.setPosition(this.player.x, this.player.y - 18);
  }

  // The closest person in trouble within reach of the lifeguard, or null.
  personInReach() {
    let best = null;
    let bestDist = EVENTS.reach;
    for (const person of this.people) {
      if (!person.inTrouble || person.carried) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, person.x, person.y);
      if (d <= bestDist) { best = person; bestDist = d; }
    }
    return best;
  }

  // ------------------------------------------------------------- helping

  updateHelping(dt) {
    // Carrying a swimmer: bring them back to the sand to finish the rescue.
    if (this.carrying) {
      this.setPrompt('Bring them to the sand!');
      if (!this.player.inWater && this.player.y > BEACH.shoreY + 20) {
        const swimmer = this.carrying;
        this.carrying = null;
        this.fixProblem(swimmer);
        swimmer.setVisible(false);
        // After a short break they go back to swimming.
        this.time.delayedCall(3000, () => { swimmer.setVisible(true); swimmer.resetHome(); });
      }
      return;
    }

    const target = this.personInReach();
    if (!target) {
      this.holdTime = 0;
      this.setPrompt('');
      return;
    }

    if (target.problem.type === 'sunburn') {
      this.setPrompt('SPACE: hand sunscreen');
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.fixProblem(target);
    } else {
      // Drifting swimmer: hold SPACE to grab them.
      if (this.spaceKey.isDown) this.holdTime += dt;
      else this.holdTime = 0;
      const pct = Math.min(1, this.holdTime / EVENTS.drift.holdToGrab);
      this.setPrompt(`Hold SPACE: rescue ${'#'.repeat(Math.round(pct * 10)).padEnd(10, '.')}`);
      if (pct >= 1) {
        this.holdTime = 0;
        this.carrying = target;
        target.carried = true;
      }
    }
  }

  fixProblem(person) {
    const p = person.problem;
    const quickness = p.timeLeft / p.total; // 1 = fixed instantly
    const points = EVENTS.fixPoints + Math.round(EVENTS.speedBonus * quickness);
    this.score += points;
    this.changeFun(EVENTS.fixFun);
    this.stats.fixed += 1;
    this.floatText(person.x, person.y - 30, `+${points}`, '#2b9348');
    person.clearProblem();
  }

  missProblem(person) {
    const penalty = EVENTS[person.problem.type].penalty;
    this.changeFun(-penalty);
    this.stats.missed += 1;
    this.floatText(person.x, person.y - 30, `-${penalty} Fun`, '#d62828');
    this.cameras.main.shake(150, 0.004);
    if (person.problem.type === 'drift') {
      // A rescue boat picks them up off-screen; they come back later.
      person.clearProblem();
      person.setVisible(false);
      this.time.delayedCall(4000, () => { person.setVisible(true); person.resetHome(); });
    } else {
      person.clearProblem();
    }
  }

  changeFun(amount) {
    this.fun = Phaser.Math.Clamp(this.fun + amount, 0, 100);
    if (this.fun <= 0) this.endDay(false);
  }

  // ------------------------------------------------------------- ending

  endDay(survived) {
    if (this.over) return;
    this.over = true;
    this.player.setVelocity(0, 0);
    this.setPrompt('');

    const stars = survived ? (this.fun >= 70 ? 3 : this.fun >= 40 ? 2 : 1) : 0;
    const title = survived ? 'Sunset! Day 1 complete' : 'Beach closed!';
    const lines = [
      title,
      '',
      `Score: ${this.score}`,
      `Fixed: ${this.stats.fixed}    Missed: ${this.stats.missed}`,
      survived ? `Stars: ${'*'.repeat(stars)}${'-'.repeat(3 - stars)}` : 'The Fun Meter ran out.',
      '',
      'Press SPACE to return to the title',
    ];

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 520, 300, 0x0d1b2a, 0.88)
      .setDepth(100).setStrokeStyle(3, 0xffd23f);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, lines.join('\n'), {
      fontFamily: 'monospace', fontSize: '22px', color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setDepth(101);

    // Wait a moment so a held SPACE from gameplay doesn't skip the screen.
    this.time.delayedCall(800, () => {
      this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Title'));
    });
  }

  // ----------------------------------------------------------------- HUD

  createHud() {
    const style = { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', fontStyle: 'bold' };

    // Fun Meter (top left).
    this.add.text(16, 12, 'FUN', style).setDepth(50);
    this.funBarBg = this.add.rectangle(66, 14, 200, 18, 0x000000, 0.5).setOrigin(0, 0).setDepth(50);
    this.funBar = this.add.rectangle(68, 16, 196, 14, 0x7ee081).setOrigin(0, 0).setDepth(51);

    // Score (top right).
    this.scoreText = this.add.text(GAME_WIDTH - 16, 12, '', style).setOrigin(1, 0).setDepth(50);

    // The sun travels across the top of the screen as the day passes.
    this.sun = this.add.circle(0, 0, 14, 0xffd23f).setDepth(49).setStrokeStyle(3, 0xffa62b);

    // Context prompt near the bottom of the screen.
    this.promptText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 24, '', {
      fontFamily: 'monospace', fontSize: '18px', color: '#3b2a12', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(50);
  }

  updateHud() {
    const f = this.fun / 100;
    this.funBar.width = 196 * f;
    this.funBar.fillColor = f > 0.5 ? 0x7ee081 : f > 0.25 ? 0xffd23f : 0xd62828;
    this.scoreText.setText(`SCORE ${this.score}`);

    // Day progress 0 -> 1 moves the sun along a low arc from left to right.
    const t = 1 - this.timeLeft / DAY.length;
    const x = Phaser.Math.Linear(330, GAME_WIDTH - 330, t);
    const y = 60 - Math.sin(t * Math.PI) * 36;
    this.sun.setPosition(x, y);
    this.sun.fillColor = Phaser.Display.Color.GetColor(255, Math.round(210 - 90 * t), Math.round(63 - 40 * t));
  }

  setPrompt(text) {
    if (this.promptText.text !== text) this.promptText.setText(text);
  }

  floatText(x, y, text, color) {
    const label = this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: '18px', fontStyle: 'bold', color,
      stroke: '#ffffff', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({
      targets: label, y: y - 30, alpha: 0, duration: 900,
      onComplete: () => label.destroy(),
    });
  }

  // Placeholder background made of colored bands. Will be replaced by art.
  drawBeach() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.deepWater).fillRect(0, 0, GAME_WIDTH, BEACH.buoyLineY);
    g.fillStyle(COLORS.water).fillRect(0, BEACH.buoyLineY, GAME_WIDTH, BEACH.shoreY - BEACH.buoyLineY);
    g.fillStyle(COLORS.sand).fillRect(0, BEACH.shoreY, GAME_WIDTH, GAME_HEIGHT - BEACH.shoreY);
    g.fillStyle(COLORS.foam).fillRect(0, BEACH.shoreY - 4, GAME_WIDTH, 8);

    // A row of buoys marks the safe swimming limit.
    for (let x = 30; x < GAME_WIDTH; x += 60) {
      this.add.image(x, BEACH.buoyLineY, 'buoy');
    }
  }
}
