import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const plugins = [react()];
const basePath = process.env.VITE_BASE_URL || '/';

export default defineConfig({
  base: basePath,
  plugins,
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
