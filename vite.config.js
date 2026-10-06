import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { contentSlots, fillSlots } from './src/content/html.ts';

export default defineConfig({
  plugins: [{ name: 'content-slots', transformIndexHtml: (html) => fillSlots(html, contentSlots()) }],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5183, strictPort: true },
  preview: { port: 5184, strictPort: true },
  build: {
    target: 'es2022',
    // three.js alone is ~500 kB minified; it is lazy-loaded after first paint, so the default warning is noise.
    chunkSizeWarningLimit: 700,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
