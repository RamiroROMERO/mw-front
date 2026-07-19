import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    watch: {
      usePolling: true
    }
  },
  plugins: [
    react(),
  ],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "entry/[name].[hash].js",
        chunkFileNames: "js/[name].[hash].js",
        assetFileNames: "assets/[name].[ext]"
      }
    }
  },
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        // Legacy @import + old global color functions (darken/lighten/etc.)
        // are used throughout src/assets/sass/**; migrating to @use/@forward
        // and the sass:color module is tracked separately in TECH_DEBT.md.
        silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@Components': path.resolve(__dirname, './src/components'),
      '@Constants': path.resolve(__dirname, './src/constants'),
      '@Containers': path.resolve(__dirname, './src/containers'),
      '@Helpers': path.resolve(__dirname, './src/helpers'),
      '@Hooks': path.resolve(__dirname, './src/hooks'),
      '@Layouts': path.resolve(__dirname, './src/layouts'),
      '@Redux': path.resolve(__dirname, './src/redux'),
      '@Router': path.resolve(__dirname, './src/router'),
      '@Views': path.resolve(__dirname, './src/views'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
