import { defineConfig } from 'vite';

// base: './' makes every file path relative, so the built game in dist/
// works when uploaded to itch.io (which serves it from a sub-folder).
export default defineConfig({
  base: './',
  build: { outDir: 'dist', assetsInlineLimit: 0, chunkSizeWarningLimit: 2000 }, // Phaser itself is ~1.5 MB
});
