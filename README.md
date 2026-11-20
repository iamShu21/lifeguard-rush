# Lifeguard Rush

A summertime beach game made for **CSD Game Jamathon 2.0** (theme: "Summertime").
You are the only lifeguard on a packed beach. Rescue drifting swimmers, hand out
sunscreen and chase off seagulls before the beach's Fun Meter runs out.

Built with [Phaser 3](https://phaser.io) (JavaScript) and [Vite](https://vitejs.dev). Runs in any modern web browser (WebGL).

## How to play

| Action | Keys |
| --- | --- |
| Move | WASD or arrow keys (you move slower in the water) |

More controls arrive as features are added.

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
| `src/scenes/BeachScene.js` | The main gameplay scene |
| `src/objects/Player.js` | The lifeguard: reads the keys and moves, slower in water |

## Credits

See [CREDITS.md](CREDITS.md) for all third-party assets.
