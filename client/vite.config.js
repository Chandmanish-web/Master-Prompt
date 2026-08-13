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
    // Optimize chunk splitting for better caching using function syntax
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/@reduxjs/toolkit') || id.includes('node_modules/react-redux')) {
            return 'redux';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/axios')) {
            return 'ui';
          }
        },
      },
    },
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 500,
    // Disable source maps for faster builds
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
