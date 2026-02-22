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
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          // Code splitting for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            // Add more chunks as needed
            // router: ['react-router-dom'],
            // state: ['zustand', '@tanstack/react-query'],
          },
        },
      },
      // Chunk size warnings
      chunkSizeWarningLimit: 500,
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
