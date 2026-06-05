// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://github.com',
  base: '/sql-learning-platform',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});
