import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

/**
 * Import path aliases — the single source of truth.
 *
 * vitest.config.js imports this rather than keeping its own copy: the two used
 * to be hand-maintained duplicates, and if they drift, code that builds fine
 * fails to resolve under test (or the reverse).
 *
 * Two constraints, both learned the hard way — static analysers (fallow, editor
 * tooling) read aliases by PARSING this file, never executing it:
 *   1. The table must live in vite.config.js. Moved to its own module, every
 *      `@/…` import looked unresolved and fallow reported 33 "dead" files.
 *   2. Entries must use the conventional `path.resolve(__dirname, …)` form.
 *      A computed root (`path.dirname(fileURLToPath(import.meta.url))`) is
 *      equivalent at runtime but is not recognised by the parser.
 * `__dirname` is not defined in ESM; Vite injects it into config files (and
 * into modules a config imports, which is why vitest.config.js can share this).
 */
export const aliases = {
  '@': path.resolve(__dirname, './src'),
  '@shared': path.resolve(__dirname, './src/shared'),
  '@components': path.resolve(__dirname, './src/shared/components'),
  '@hooks': path.resolve(__dirname, './src/shared/hooks'),
  '@utils': path.resolve(__dirname, './src/shared/utils'),
  '@modules': path.resolve(__dirname, './src/modules'),
  '@store': path.resolve(__dirname, './src/store'),
  '@api': path.resolve(__dirname, './src/api'),
  '@lib': path.resolve(__dirname, './src/lib'),
};

/**
 * Chunks reached ONLY through a `lazy()` / dynamic import behind a user
 * interaction, so they must not be preloaded on first paint.
 *
 * Names must match the `manualChunks` names below. Adding a chunk here that a
 * route needs during its initial render will make that route SLOWER (serial
 * fetch instead of parallel), so measure before extending this list.
 */
const LAZY_ONLY_CHUNKS = [
  'emoji', // emoji-mart, 108 kB gzipped — opens only when a picker button is clicked
];

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),
    ],

    // Drop console/debugger in production transforms (must be top-level, not under build)
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },

    // Path aliases for cleaner imports
    resolve: {
      alias: aliases,
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
      modulePreload: {
        // Vite preloads every statically-reachable chunk, which pulled the 108 kB
        // emoji-mart bundle into <head> on EVERY page load — including the landing
        // page — even though both call sites already `lazy()` it. The preload does
        // not block first paint, but it does compete with the LCP image for
        // bandwidth at high priority.
        //
        // Only chunks that are genuinely interaction-gated belong here. Do not add
        // a chunk that some route needs during its initial render: dropping the
        // preload for those trades a parallel fetch for a serial one and makes
        // things slower, not faster.
        resolveDependencies: (_url, deps) =>
          deps.filter((dep) => !LAZY_ONLY_CHUNKS.some((name) => dep.includes(name))),
      },
      rollupOptions: {
        output: {
          // Prevent Rollup from moving shared helpers into an interaction-only
          // manual chunk. Without this, vendor imported emoji and forced the
          // 110 kB gzip picker onto every route despite its dynamic import.
          onlyExplicitManualChunks: true,
          // Function form is reliable in Vite 7 — matches on actual module file paths
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            // Emoji picker — emoji-mart "native" entry was producing a 432 kB unnamed chunk
            if (id.includes('/emoji-mart/') || id.includes('/@emoji-mart/')) return 'emoji';

            // Rollup handles every statically reachable shared dependency. Named
            // React/router/state chunks form cycles with only-explicit chunking.
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
