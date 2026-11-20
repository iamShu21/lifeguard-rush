import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, BEACH, COLORS, DAY, EVENTS, GULLS, COMBO,
} from '../config.js';
import Player from '../objects/Player.js';
import Beachgoer from '../objects/Beachgoer.js';
import Seagull from '../objects/Seagull.js';

// Where people sit or swim at the start of the day.
const SUNBATHER_SPOTS = [
  [120, 300], [260, 350], [420, 290], [560, 380], [700, 310], [840, 360],
  [180, 450], [480, 470], [780, 460],
];
const SWIMMER_SPOTS = [[150, 175], [330, 160], [520, 185], [690, 165], [860, 180]];

// Slide from a start value to an end value as the day goes on (t: 0 to 1).
const ramp = ({ start, end }, t) => Phaser.Math.Linear(start, end, t);

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
    this.spawnTimer = 1.5;      // first problem appears quickly
    this.gullTimer = GULLS.firstAfter;
    this.whistleCooldown = 0;
    this.taps = 0;              // SPACE taps on the current rescue
    this.carrying = null;       // the swimmer being carried, if any
    this.combo = 0;             // problems fixed in a row
    this.comboTimer = 0;        // time left to keep the combo going
    this.rushHour = false;
    this.over = false;
    this.stats = { fixed: 0, missed: 0, bestCombo: 0 };

    this.people = [
      ...SUNBATHER_SPOTS.map(([x, y]) => new Beachgoer(this, x, y, 'sunbather')),
      ...SWIMMER_SPOTS.map(([x, y]) => new Beachgoer(this, x, y, 'swimmer')),
    ];
    this.gulls = [];

    this.player = new Player(this, GAME_WIDTH / 2, BEACH.shoreY + 30);
    this.player.setDepth(10);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.whistleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

    // One particle emitter, reused for every burst effect.
    this.burst = this.add.particles(0, 0, 'dot', {
      speed: { min: 80, max: 240 },
      lifespan: 500,
      scale: { start: 1, end: 0 },
      emitting: false,
    }).setDepth(40);

    this.createHud();
  }

  update(time, deltaMs) {
    if (this.over) return;
    const dt = Math.min(deltaMs / 1000, 0.05); // avoid huge jumps after a lag spike

    this.player.update(dt);
    this.updateClock(dt);
    this.updateSpawning(dt);
    this.updatePeople(dt);
    this.updateGulls(dt);
    this.updateHelping(dt);
    this.updateCombo(dt);
    this.updateHud();
  }

  // How far through the day we are: 0 at sunrise, 1 at sunset.
  get dayProgress() {
    return 1 - this.timeLeft / DAY.length;
  }

  // ---------------------------------------------------------------- clock

  updateClock(dt) {
    this.timeLeft -= dt;
    if (!this.rushHour && this.timeLeft <= DAY.rushHour) this.startRushHour();
    if (this.timeLeft <= 0) this.endDay(true);
  }

  startRushHour() {
    this.rushHour = true;
    this.cameras.main.flash(300, 255, 200, 80);
    const banner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'RUSH HOUR!\nDOUBLE POINTS', {
      fontFamily: 'monospace', fontSize: '48px', fontStyle: 'bold', align: 'center',
      color: '#ffd23f', stroke: '#e8352b', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(90).setScale(0.2);
    this.tweens.add({ targets: banner, scale: 1, duration: 350, ease: 'Back.Out' });
    this.tweens.add({
      targets: banner, alpha: 0, delay: 1600, duration: 400, onComplete: () => banner.destroy(),
    });
  }

  // ------------------------------------------------------------- spawning

  // Every few seconds, give a random person who is fine a new problem.
  // The gap between problems shrinks as the day goes on.
  updateSpawning(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const rush = this.rushHour ? 0.75 : 1;
    this.spawnTimer = ramp(EVENTS.spawnEvery, this.dayProgress) * rush;

    const active = this.people.filter((p) => p.inTrouble).length;
    if (active >= Math.round(ramp(EVENTS.maxActive, this.dayProgress)) + (this.rushHour ? 1 : 0)) return;

    const calm = this.people.filter((p) => !p.inTrouble && !p.carried && p.visible && p.alpha === 1);
    if (calm.length === 0) return;
    const person = Phaser.Utils.Array.GetRandom(calm);
    person.startProblem(person.kind === 'swimmer' ? 'drift' : 'sunburn');
    this.popIn(person);
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

  // ---------------------------------------------------------------- gulls

  updateGulls(dt) {
    this.gullTimer -= dt;
    if (this.gullTimer <= 0) {
      this.gullTimer = ramp(GULLS.spawnEvery, this.dayProgress) * (this.rushHour ? 0.7 : 1);
      const targets = this.people.filter((p) => p.kind === 'sunbather' && !this.gulls.some((g) => g.target === p));
      if (targets.length) this.gulls.push(new Seagull(this, Phaser.Utils.Array.GetRandom(targets)));
    }

    this.whistleCooldown -= dt;
    if (Phaser.Input.Keyboard.JustDown(this.whistleKey) && this.whistleCooldown <= 0) this.blowWhistle();

    for (const gull of this.gulls) {
      if (gull.tick(dt) === 'stole') {
        this.changeFun(-GULLS.penalty);
        this.stats.missed += 1;
        this.breakCombo();
        this.floatText(gull.x, gull.y - 20, `Snack stolen! -${GULLS.penalty}`, '#d62828');
        continue;
      }
      // Running into a gull scares it away.
      if (gull.canBeShooed
        && Phaser.Math.Distance.Between(this.player.x, this.player.y, gull.x, gull.y) < 32) {
        this.shooGull(gull);
      }
    }
    this.gulls = this.gulls.filter((g) => g.active);
  }

  shooGull(gull) {
    const quickness = gull.state === 'incoming' ? 1 : gull.timeLeft / GULLS.stealTime;
    gull.flyAway();
    this.burst.setParticleTint(0xffffff);
    this.burst.explode(10, gull.x, gull.y);
    this.reward(gull.x, gull.y, quickness);
  }

  blowWhistle() {
    this.whistleCooldown = GULLS.whistleCooldown;
    // An expanding ring shows the whistle's blast.
    const wave = this.add.circle(this.player.x, this.player.y, 20).setStrokeStyle(4, 0xffffff).setDepth(45);
    this.tweens.add({
      targets: wave, scale: 30, alpha: 0, duration: 500, onComplete: () => wave.destroy(),
    });
    this.gulls.filter((g) => g.canBeShooed).forEach((g) => this.shooGull(g));
  }

  // ------------------------------------------------------------- helping

  updateHelping() {
    // Carrying a swimmer: bring them back to the sand to finish the rescue.
    if (this.carrying) {
      this.setPrompt('Bring them to the sand!');
      if (!this.player.inWater && this.player.y > BEACH.shoreY + 20) {
        const swimmer = this.carrying;
        this.carrying = null;
        this.burst.setParticleTint(0x9be7ff);
        this.burst.explode(24, swimmer.x, swimmer.y);
        this.fixProblem(swimmer);
        swimmer.setVisible(false);
        // After a short break they go back to swimming.
        this.time.delayedCall(3000, () => { swimmer.setVisible(true); swimmer.resetHome(); });
      }
      return;
    }

    const target = this.personInReach();
    if (!target) {
      this.taps = 0;
      this.setPrompt('');
      return;
    }

    if (target.problem.type === 'sunburn') {
      this.setPrompt('SPACE: hand sunscreen');
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.burst.setParticleTint(0xffd23f);
        this.burst.explode(14, target.x, target.y);
        this.fixProblem(target);
      }
    } else {
      // Drifting swimmer: tap SPACE quickly to pull them in.
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.taps += 1;
        this.tweens.add({ targets: target, scale: 1.25, duration: 60, yoyo: true });
      }
      const need = EVENTS.drift.taps;
      this.setPrompt(`Tap SPACE fast! ${'#'.repeat(this.taps)}${'.'.repeat(Math.max(0, need - this.taps))}`);
      if (this.taps >= need) {
        this.taps = 0;
        this.carrying = target;
        target.carried = true;
        this.burst.setParticleTint(0x9be7ff);
        this.burst.explode(12, target.x, target.y);
      }
    }
  }

  fixProblem(person) {
    const p = person.problem;
    person.clearProblem();
    this.popIn(person);
    this.reward(person.x, person.y, p.timeLeft / p.total);
  }

  // Points, Fun and combo for anything fixed. quickness: 1 = instant.
  reward(x, y, quickness) {
    this.combo += 1;
    this.comboTimer = COMBO.window;
    this.stats.bestCombo = Math.max(this.stats.bestCombo, this.combo);
    this.stats.fixed += 1;

    const multiplier = Math.min(this.combo, COMBO.maxMultiplier) * (this.rushHour ? 2 : 1);
    const points = (EVENTS.fixPoints + Math.round(EVENTS.speedBonus * quickness)) * multiplier;
    this.score += points;
    this.changeFun(EVENTS.fixFun);

    const label = multiplier > 1 ? `+${points} x${multiplier}` : `+${points}`;
    this.floatText(x, y - 30, label, '#2b9348');
    this.tweens.add({ targets: this.scoreText, scale: 1.25, duration: 80, yoyo: true });
  }

  missProblem(person) {
    const penalty = EVENTS[person.problem.type].penalty;
    this.changeFun(-penalty);
    this.stats.missed += 1;
    this.breakCombo();
    this.floatText(person.x, person.y - 30, `-${penalty} Fun`, '#d62828');
    this.cameras.main.shake(180, 0.006);
    this.cameras.main.flash(120, 214, 40, 40);
    if (person.problem.type === 'drift') {
      // A rescue boat picks them up off-screen; they come back later.
      person.clearProblem();
      person.setVisible(false);
      this.time.delayedCall(4000, () => { person.setVisible(true); person.resetHome(); });
    } else {
      person.clearProblem();
    }
  }

  // --------------------------------------------------------------- combo

  updateCombo(dt) {
    if (this.combo === 0) return;
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) this.combo = 0;
  }

  breakCombo() {
    if (this.combo >= 3) this.floatText(this.player.x, this.player.y - 40, 'Combo lost!', '#d62828');
    this.combo = 0;
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
      `Best combo: ${this.stats.bestCombo}`,
      survived ? `Stars: ${'*'.repeat(stars)}${'-'.repeat(3 - stars)}` : 'The Fun Meter ran out.',
      '',
      'Press SPACE to return to the title',
    ];

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 520, 320, 0x0d1b2a, 0.9)
      .setDepth(100).setStrokeStyle(3, 0xffd23f);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, lines.join('\n'), {
      fontFamily: 'monospace', fontSize: '22px', color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setDepth(101);

    // Wait a moment so a SPACE pressed during gameplay doesn't skip the screen.
    this.time.delayedCall(800, () => {
      this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Title'));
    });
  }

  // ----------------------------------------------------------------- HUD

  createHud() {
    const style = { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', fontStyle: 'bold' };

    // Fun Meter (top left).
    this.add.text(16, 12, 'FUN', style).setDepth(50);
    this.add.rectangle(66, 14, 200, 18, 0x000000, 0.5).setOrigin(0, 0).setDepth(50);
    this.funBar = this.add.rectangle(68, 16, 196, 14, 0x7ee081).setOrigin(0, 0).setDepth(51);

    // Score and combo (top right).
    this.scoreText = this.add.text(GAME_WIDTH - 16, 22, '', style).setOrigin(1, 0.5).setDepth(50);
    this.comboText = this.add.text(GAME_WIDTH - 16, 46, '', { ...style, color: '#ffd23f' })
      .setOrigin(1, 0.5).setDepth(50);

    // Ability status (under the Fun Meter).
    this.abilityText = this.add.text(16, 40, '', { ...style, fontSize: '14px' }).setDepth(50);

    // The sun travels across the top of the screen as the day passes.
    this.sun = this.add.circle(0, 0, 14, 0xffd23f).setDepth(49).setStrokeStyle(3, 0xffa62b);

    // Sunset glow: an orange layer that fades in as the day ends.
    this.sunset = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xff7b39, 0)
      .setOrigin(0, 0).setDepth(30);

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

    const mult = Math.min(this.combo, COMBO.maxMultiplier);
    this.comboText.setText(this.combo >= 2 ? `COMBO x${mult}  ${'|'.repeat(Math.ceil(this.comboTimer * 3))}` : '');

    const whistle = this.whistleCooldown <= 0 ? 'READY' : `${Math.ceil(this.whistleCooldown)}s`;
    const dash = this.player.dashReady ? 'READY' : '...';
    this.abilityText.setText(`[SHIFT] Dash ${dash}   [Q] Whistle ${whistle}`);

    // Day progress moves the sun along a low arc from left to right.
    const t = this.dayProgress;
    this.sun.setPosition(Phaser.Math.Linear(330, GAME_WIDTH - 330, t), 60 - Math.sin(t * Math.PI) * 36);
    this.sun.fillColor = Phaser.Display.Color.GetColor(255, Math.round(210 - 90 * t), Math.round(63 - 40 * t));
    this.sunset.fillAlpha = Math.max(0, t - 0.6) * 0.45;
  }

  setPrompt(text) {
    if (this.promptText.text !== text) this.promptText.setText(text);
  }

  // A quick squash-and-stretch so new problems and fixes catch the eye.
  popIn(target) {
    this.tweens.add({ targets: target, scaleX: 1.3, scaleY: 0.8, duration: 90, yoyo: true });
  }

  floatText(x, y, text, color) {
    const label = this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: '18px', fontStyle: 'bold', color,
      stroke: '#ffffff', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({
      targets: label, y: y - 34, alpha: 0, duration: 900,
      onComplete: () => label.destroy(),
    });
  }

  // Placeholder background made of colored bands. Will be replaced by art.
  drawBeach() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.deepWater).fillRect(0, 0, GAME_WIDTH, BEACH.buoyLineY);
    g.fillStyle(COLORS.water).fillRect(0, BEACH.buoyLineY, GAME_WIDTH, BEACH.shoreY - BEACH.buoyLineY);
    g.fillStyle(COLORS.sand).fillRect(0, BEACH.shoreY, GAME_WIDTH, GAME_HEIGHT - BEACH.shoreY);

    // Foam along the shore that gently washes in and out.
    const foam = this.add.rectangle(0, BEACH.shoreY - 4, GAME_WIDTH, 8, COLORS.foam).setOrigin(0, 0);
    this.tweens.add({ targets: foam, y: BEACH.shoreY + 2, scaleY: 1.6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    // A row of buoys marks the safe swimming limit; they bob on the waves.
    for (let x = 30; x < GAME_WIDTH; x += 60) {
      const buoy = this.add.image(x, BEACH.buoyLineY, 'buoy');
      this.tweens.add({ targets: buoy, y: BEACH.buoyLineY - 3, duration: 900, yoyo: true, repeat: -1, delay: x * 3, ease: 'Sine.InOut' });
    }
  }
}
