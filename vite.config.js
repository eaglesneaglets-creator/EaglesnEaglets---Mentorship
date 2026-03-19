import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],

    // Path aliases for cleaner imports
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@components': path.resolve(__dirname, './src/shared/components'),
        '@hooks': path.resolve(__dirname, './src/shared/hooks'),
        '@utils': path.resolve(__dirname, './src/shared/utils'),
        '@modules': path.resolve(__dirname, './src/modules'),
        '@store': path.resolve(__dirname, './src/store'),
        '@api': path.resolve(__dirname, './src/api'),
        '@lib': path.resolve(__dirname, './src/lib'),
      },
    },

    // Development server config
    server: {
      port: 5173,
      strictPort: true,
      watch: {
        usePolling: true,
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Build optimizations
    build: {
      target: 'es2020',
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          // Code splitting for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            state: ['zustand', '@tanstack/react-query'],
            ui: ['framer-motion', 'lucide-react'],
          },
        },
      },
      // Chunk size warnings (three.js is ~725 KB minified, intentionally lazy-loaded)
      chunkSizeWarningLimit: 800,
    },

    // Environment variable prefix
    envPrefix: 'VITE_',

    // Preview server (for testing production builds)
    preview: {
      port: 4173,
      strictPort: true,
    },
  };
});
