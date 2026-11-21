import { fileURLToPath } from 'node:url';

import mdx from '@mdx-js/rollup';
import rehypeShiki from '@shikijs/rehype';
import type { RehypeShikiOptions } from '@shikijs/rehype';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { defineConfig } from 'vite';

import { ogImagePlugin } from './og/plugin.ts';

const highlighting: RehypeShikiOptions = {
  themes: { light: 'github-light', dark: 'github-dark' },
  defaultColor: 'light',
  colorReplacements: {
    'github-light': { '#e36209': '#AD4B07' },
    'github-dark': { '#6a737d': '#9DA7B1' },
  },
  langs: [
    'typescript',
    'tsx',
    'shellscript',
    'javascript',
    'json',
    'css',
    'html',
    'markdown',
  ],
  addLanguageClass: true,
};

export default defineConfig({
  plugins: [
    ogImagePlugin(),
    mdx({
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, [rehypeShiki, highlighting]],
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      {
        find: /^tensum\/(css|coupled)$/u,
        replacement: fileURLToPath(new URL('../../packages/tensum/src/', import.meta.url)) + '$1.ts',
      },
      {
        find: /^tensum$/u,
        replacement: fileURLToPath(new URL('../../packages/tensum/src/index.ts', import.meta.url)),
      },
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
  },
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: { codeSplitting: { groups: [{ name: 'vendor', test: /node_modules/u }] } },
    },
  },
});
