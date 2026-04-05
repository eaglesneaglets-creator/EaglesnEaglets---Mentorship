import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],

    // Drop console/debugger in production transforms (must be top-level, not under build)
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },

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
      sourcemap: mode === 'development',
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          // Function form is reliable in Vite 7 — matches on actual module file paths
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            // React core — was producing empty vendor chunk with object form
            if (id.includes('/react-dom/') || id.includes('/react/') && !id.includes('react-router') && !id.includes('react-hook-form')) {
              return 'vendor';
            }
            if (id.includes('/react-router') || id.includes('/react-router-dom/')) return 'router';

            // Three.js + Vanta (landing page 3D background) — large but isolated
            if (id.includes('/three/') || id.includes('/vanta/')) return 'three';

            // Emoji picker — emoji-mart "native" entry was producing a 432 kB unnamed chunk
            if (id.includes('/emoji-mart/') || id.includes('/@emoji-mart/')) return 'emoji';

            // Charts
            if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory-')) return 'charts';

            // State management
            if (id.includes('/zustand/') || id.includes('/@tanstack/')) return 'state';

            // UI / animation
            if (id.includes('/framer-motion/') || id.includes('/lucide-react/')) return 'ui';

            // Validation
            if (id.includes('/zod/')) return 'zod';
          },
        },
        treeshake: {
          moduleSideEffects: false,
        },
      },
      // three.js alone is 725 kB — raise limit to avoid noise on known-large chunks
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
