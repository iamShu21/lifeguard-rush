import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';

// The title screen with short how-to-play instructions.
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.add.rectangle(cx, GAME_HEIGHT * 0.3, GAME_WIDTH, GAME_HEIGHT * 0.6, COLORS.water);
    this.add.rectangle(cx, GAME_HEIGHT * 0.8, GAME_WIDTH, GAME_HEIGHT * 0.4, COLORS.sand);
    this.add.circle(GAME_WIDTH - 120, 90, 46, 0xffd23f);

    this.add.text(cx, 110, 'LIFEGUARD RUSH', {
      fontFamily: 'monospace', fontSize: '56px', fontStyle: 'bold',
      color: '#ffffff', stroke: '#e8352b', strokeThickness: 8,
    }).setOrigin(0.5);

    const howTo = [
      'You are the only lifeguard on a busy summer beach.',
      'Help everyone before the Fun Meter runs out!',
      '',
      'Move ............... WASD or arrow keys',
      'Sunburn (SUN) ...... walk over, press SPACE',
      'Drifting (HELP) .... swim out, hold SPACE,',
      '                     carry them to the sand',
      '',
      'Survive until sunset.',
    ];
    this.add.text(cx, 300, howTo.join('\n'), {
      fontFamily: 'monospace', fontSize: '18px', color: '#0d1b2a', lineSpacing: 4,
      backgroundColor: '#ffffffcc', padding: { x: 18, y: 14 },
    }).setOrigin(0.5);

    const start = this.add.text(cx, GAME_HEIGHT - 50, 'Press SPACE to start', {
      fontFamily: 'monospace', fontSize: '24px', fontStyle: 'bold', color: '#e8352b',
    }).setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Beach'));
  }
}
