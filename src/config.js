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
  towel: [0x4cc9a6, 0xf28fb1, 0xffd23f, 0x8a7cf0],
  skin: 0xf0b48a,
  burnt: 0xff4d4d,
  swimCap: 0xffe14d,
};

export const DAY = {
  length: 180,      // seconds from sunrise to sunset
  startFun: 70,     // Fun Meter starts here, out of 100
};

// How each kind of beach problem behaves.
export const EVENTS = {
  spawnEvery: 4.5,  // seconds between new problems
  maxActive: 4,     // never more than this many problems at once
  reach: 44,        // how close (pixels) the lifeguard must be to help
  fixPoints: 100,   // points for every problem fixed
  speedBonus: 50,   // extra points, the faster you fix it the more you get
  fixFun: 2,        // Fun gained for every fix
  sunburn: { time: 10, penalty: 5 },
  drift: { time: 14, penalty: 20, holdToGrab: 1.5, driftSpeed: 7 },
};
