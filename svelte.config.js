import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Enable full TypeScript support
  preprocess: preprocess({ typescript: true }),

  kit: {
    adapter: adapter(),
    alias: {
      "@/*": "./src/lib/*", // make sure this path matches your project structure
    }
  }
};

export default config;
