// All the numbers that tune the game live here, so they are easy to tweak
// without digging through the scene code.

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// The beach is split into horizontal bands, top to bottom:
// deep water (past the buoys), swimming water, then sand.
export const BEACH = {
  buoyLineY: 110,   // swimmers past this line are in danger
  shoreY: 230,      // water above this line, sand below it
};

export const PLAYER = {
  sandSpeed: 220,   // pixels per second when running on sand
  waterSpeed: 110,  // half speed while swimming, so rescues cost time
  size: 28,
};

export const COLORS = {
  deepWater: 0x1f6fa8,
  water: 0x3fa3d8,
  foam: 0xe8f6ff,
  sand: 0xf2d39b,
  buoy: 0xff5a36,
  player: 0xe8352b,   // lifeguard red
  playerTrim: 0xffffff,
};
