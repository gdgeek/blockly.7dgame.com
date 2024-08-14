/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    cors: {
      origin: '*', // 允许任何域名
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // 允许任何请求方法
      allowedHeaders: '*', // 允许任何请求头
      credentials: true, // 如果需要支持发送凭据的跨域请求，可以设置为 true
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) =>
            [
              'field',
              'block',
              'category',
              'xml',
              'mutation',
              'value',
              'sep',
              'shadow',
            ].includes(tag),
        },
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: fileURLToPath(
            new URL('./node_modules/blockly/media/*', import.meta.url),
          ),
          dest: 'media',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
