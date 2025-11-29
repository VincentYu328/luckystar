import adapter from '@sveltejs/adapter-node';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: sveltePreprocess(),

  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false
    }),

    paths: {
      relative: false
    },

    alias: {
      $components: 'src/lib/components',
      $utils: 'src/lib/utils',
      $stores: 'src/lib/stores',
      $server: 'src/lib/server',
      $types: 'src/lib/types'
    },

    csrf: {
      trustedOrigins: ['*']
    }
  }
};

export default config;
