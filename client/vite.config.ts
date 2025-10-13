import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Path resolution for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/graphql': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build optimization configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Target modern browsers for better performance
    target: 'esnext',
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: {
          // Vendor chunk for React and React-related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching libraries
          'query-vendor': ['@tanstack/react-query'],
          // State management
          'state-vendor': ['zustand'],
        },
      },
    },
    // Enable minification (terser options are applied by default)
    minify: 'terser',
  },

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
  },
});
