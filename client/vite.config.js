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
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux': ['@reduxjs/toolkit', 'react-redux'],
          'ui': ['framer-motion', 'axios'],
        },
      },
    },
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 500,
    // Enable source maps for debugging in production
    sourcemap: false,
    // Minify with terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux', 'axios'],
  },
});
