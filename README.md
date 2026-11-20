# Lifeguard Rush

A summertime beach game made for **CSD Game Jamathon 2.0** (theme: "Summertime").
You are the only lifeguard on a packed beach. Rescue drifting swimmers, hand out
sunscreen and chase off seagulls before the beach's Fun Meter runs out.

Built with [Phaser 3](https://phaser.io) (JavaScript) and [Vite](https://vitejs.dev). Runs in any modern web browser (WebGL).

## How to play

| Action | Keys |
| --- | --- |
| Move | WASD or arrow keys (you move slower in the water) |
| Dash | SHIFT |
| Hand sunscreen to a sunburned sunbather (SUN marker) | Walk next to them, press SPACE |
| Rescue a drifting swimmer (HELP marker) | Swim next to them, tap SPACE quickly, then carry them back to the sand |
| Scare off a seagull (GULL marker) | Run into it, or press Q to blow your whistle (15 second cooldown) |

Each problem has a ring timer. Fix it before the ring empties, or the beach loses Fun.
Fix problems back to back for a combo (up to x5 points). The last 25 seconds are Rush Hour, with double points.
Survive until sunset with Fun above zero. The day lasts 2 minutes and gets busier as it goes.

## Running it on your computer

1. Install [Node.js](https://nodejs.org) (the LTS version).
2. In this folder, run `npm install` once.
3. Run `npm run dev` and open the address it prints (usually http://localhost:5173).
   The page reloads by itself whenever a file changes.

## Making the web build for itch.io

Run `npm run build`. The finished game is in the `dist/` folder.
Zip the **contents** of `dist/` (so `index.html` is at the top of the zip) and upload that.

## How the code is organized

| File | What it does |
| --- | --- |
| `src/main.js` | Starts Phaser with the game settings and the list of scenes |
| `src/config.js` | All tuning numbers and colors in one place (speeds, beach layout) |
| `src/scenes/BootScene.js` | Prepares the graphics, then starts the beach |
| `src/scenes/BeachScene.js` | One beach day: spawning problems and gulls, helping, combos, Fun Meter, score, Rush Hour, results |
| `src/scenes/TitleScene.js` | Title screen with how-to-play instructions |
| `src/objects/Player.js` | The lifeguard: reads the keys, moves (slower in water) and dashes |
| `src/objects/Beachgoer.js` | A sunbather or swimmer, their problem and its ring timer |
| `src/objects/Seagull.js` | A seagull that flies in and tries to steal a snack |
| `src/utils/ring.js` | Draws the countdown ring marker |

## Credits

See [CREDITS.md](CREDITS.md) for all third-party assets.
