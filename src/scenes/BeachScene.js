import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, BEACH, COLORS } from '../config.js';
import Player from '../objects/Player.js';

// The main gameplay scene: the beach, the lifeguard and (soon) the events.
export default class BeachScene extends Phaser.Scene {
  constructor() {
    super('Beach');
  }

  create() {
    this.drawBeach();
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 80);

    // Small on-screen label so we can see the water slowdown working.
    this.statusText = this.add.text(12, GAME_HEIGHT - 28, '', {
      fontFamily: 'monospace', fontSize: '16px', color: '#3b2a12',
    });
  }

  update() {
    this.player.update();
    this.statusText.setText(
      `${this.player.inWater ? 'Swimming (slow)' : 'Running on sand'}   |   Move: WASD / arrow keys`,
    );
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
