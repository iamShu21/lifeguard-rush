import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import BeachScene from './scenes/BeachScene.js';

// The game's settings. Phaser picks WebGL automatically and falls back to
// Canvas on old browsers.
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1b2a3a',
  pixelArt: true,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: {
    mode: Phaser.Scale.FIT,               // grow or shrink to fit the window
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, BeachScene],          // the first one listed runs first
});

// Handy for debugging in the browser console: window.__game
window.__game = game;
