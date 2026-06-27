import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_SHELL_PORT) || 3000,
  },
  resolve: {
    alias: {
      '@shell-platform/event-bus': path.resolve(
        __dirname,
        '../../packages/event-bus/src/index.ts'
      ),
      '@shell-platform/mock-data': path.resolve(
        __dirname,
        '../../packages/mock-data/src/index.ts'
      ),
      '@shell-platform/scaffolder': path.resolve(
        __dirname,
        '../../packages/scaffolder/src/index.ts'
      ),
    },
  },
  optimizeDeps: {
    include: ['anser', '@codesandbox/sandpack-react'],
  },
  build: {
    commonjsOptions: {
      include: [/anser/, /node_modules/],
    },
  },
});
