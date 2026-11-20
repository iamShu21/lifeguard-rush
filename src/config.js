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
  dashSpeed: 560,   // short burst of speed with SHIFT
  dashTime: 0.16,   // seconds a dash lasts
  dashCooldown: 0.8,
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
  burnt: 0xff7a7a,
  swimCap: 0xffe14d,
  gull: 0xf4f4f4,
  gullWing: 0x9aa5b1,
  beak: 0xffb000,
};

export const DAY = {
  length: 120,      // seconds from sunrise to sunset
  rushHour: 25,     // the last 25 seconds are Rush Hour: faster, double points
  startFun: 70,     // Fun Meter starts here, out of 100
};

// How each kind of beach problem behaves.
// "start" values apply at sunrise, "end" values by sunset; the game slides
// smoothly between them so the day keeps getting busier.
export const EVENTS = {
  spawnEvery: { start: 3.2, end: 1.3 },  // seconds between new problems
  maxActive: { start: 3, end: 7 },       // most problems at once
  reach: 44,        // how close (pixels) the lifeguard must be to help
  fixPoints: 100,   // points for every problem fixed
  speedBonus: 50,   // extra points, the faster you fix it the more you get
  fixFun: 3,        // Fun gained for every fix
  sunburn: { time: 8, penalty: 5 },
  drift: { time: 11, penalty: 18, taps: 6, driftSpeed: 9 },
};

export const GULLS = {
  firstAfter: 10,                    // seconds into the day before gulls show up
  spawnEvery: { start: 8, end: 3.5 },
  flySpeed: 90,                      // pixels per second
  stealTime: 5,                      // seconds to shoo it before it grabs the snack
  penalty: 8,
  whistleCooldown: 15,               // seconds between whistles
};

export const COMBO = {
  window: 4,        // seconds to fix the next problem and keep the combo going
  maxMultiplier: 5,
};
