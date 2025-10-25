import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'lucide-react',
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
    ],
    exclude: [
      '@stomp/stompjs',
      'chart.js/auto',
      'quill'
    ],
  },
  css: {
    devSourcemap: false,
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    } as any,
    rollupOptions: {
      external: ['chart.js/auto', 'quill'],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-avatar',
            '@radix-ui/react-progress',
            '@radix-ui/react-separator',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-icons',
          ],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts'],
          'animation-vendor': ['framer-motion'],
          'websocket-vendor': ['@stomp/stompjs'],
          'utils-vendor': ['date-fns', 'clsx', 'class-variance-authority', 'tailwind-merge'],
          'theme-vendor': ['next-themes'],
          'state-vendor': ['zustand'],
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
