import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import visualizer from 'rollup-plugin-visualizer';

const plugins = [react()];

if (process.env.ANALYZE) {
  plugins.push(visualizer({ filename: 'dist/bundle-analysis.html', open: false }));
}

export default defineConfig({
  base: '/Master-Prompt/',
  plugins,
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
