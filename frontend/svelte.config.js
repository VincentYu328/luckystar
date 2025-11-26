import adapter from '@sveltejs/adapter-node';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // 支持 <script lang="ts">、PostCSS、SCSS 等
  preprocess: sveltePreprocess(),

  kit: {
    // Hostinger / VPS 上用 Node 适配器，产出 build/
    adapter: adapter({
      out: 'build',
      precompress: false
    }),

    // 生成绝对路径，方便 Nginx 反代部署
    paths: {
      relative: false
    },

    // 和 vite.config.js、tsconfig.json 对齐的别名
    alias: {
      $components: 'src/lib/components',
      $utils: 'src/lib/utils',
      $stores: 'src/lib/stores',
      $server: 'src/lib/server',
      $types: 'src/lib/types'
    },

    // ⭐⭐⭐ 添加这个配置来禁用 CSRF 检查 ⭐⭐⭐
    csrf: {
      checkOrigin: false
    }
  }
};

export default config;