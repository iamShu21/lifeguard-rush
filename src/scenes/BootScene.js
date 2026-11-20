import Phaser from 'phaser';
import { PLAYER, COLORS } from '../config.js';

// BootScene prepares the graphics before the game starts.
// For now it draws simple placeholder shapes. Later, when the real art is
// chosen, this is where we load the image files instead (this.load.image).
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.makePlaceholderTextures();
    this.scene.start('Title');
  }

  makePlaceholderTextures() {
    const g = this.add.graphics();

    // Lifeguard: a red circle with a white stripe, like a lifeguard shirt.
    const s = PLAYER.size;
    g.fillStyle(COLORS.player).fillCircle(s / 2, s / 2, s / 2);
    g.fillStyle(COLORS.playerTrim).fillRect(4, s / 2 - 3, s - 8, 6);
    g.generateTexture('player', s, s);
    g.clear();

    // Buoy: a small orange ball.
    g.fillStyle(COLORS.buoy).fillCircle(8, 8, 8);
    g.generateTexture('buoy', 16, 16);
    g.clear();

    // Sunbathers: a person lying on a towel. One texture per towel color.
    COLORS.towel.forEach((towel, i) => {
      g.fillStyle(towel).fillRect(0, 0, 24, 44);
      g.fillStyle(COLORS.skin).fillCircle(12, 9, 7);   // head
      g.fillRoundedRect(6, 16, 12, 24, 4);              // body
      g.generateTexture(`sunbather${i}`, 24, 44);
      g.clear();
    });

    // Swimmer: a head with a swim cap and a ripple around it.
    g.lineStyle(2, COLORS.foam).strokeCircle(14, 14, 12);
    g.fillStyle(COLORS.skin).fillCircle(14, 14, 7);
    g.fillStyle(COLORS.swimCap).fillRect(7, 7, 14, 5);
    g.generateTexture('swimmer', 28, 28);
    g.clear();

    // Seagull: white body, grey wing, orange beak.
    g.fillStyle(COLORS.gull).fillEllipse(14, 12, 22, 12);
    g.fillStyle(COLORS.gull).fillCircle(24, 8, 5);
    g.fillStyle(COLORS.gullWing).fillTriangle(8, 10, 18, 10, 12, 0);
    g.fillStyle(COLORS.beak).fillTriangle(28, 7, 28, 11, 33, 9);
    g.fillStyle(0x000000).fillCircle(25, 7, 1.2);
    g.generateTexture('gull', 34, 20);
    g.clear();

    // A small white dot used for particle bursts.
    g.fillStyle(0xffffff).fillCircle(4, 4, 4);
    g.generateTexture('dot', 8, 8);

    g.destroy();
  }
}
