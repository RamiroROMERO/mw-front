import fs from 'node:fs';
import { defineConfig, transformWithEsbuild } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
// import tsconfigPaths from 'vite-tsconfig-paths'

const sourceJSPattern = /\/src\/.*\.js$/;
const rollupPlugin = (matchers) => ({
  name: "js-in-jsx",
  load(id) {
    if (matchers.some(matcher => matcher.test(id))) {
      const file = fs.readFileSync(id, { encoding: "utf-8" });
      return esbuild.transformSync(file, { loader: "jsx" });
    }
  }
});

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
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  esbuild: {
    loader: "jsx",
    include: ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx", sourceJSPattern],
    exclude: [],
  }
})
