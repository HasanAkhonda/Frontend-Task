 
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
  },
  preprocess: preprocess(),
   alias: {
      "@/*": "./src/lib/*", // make sure this path matches your project structure
    }
};

export default config;
