import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  site: 'https://titanwings.github.io',
  base: '/colleague-skill-site',
  integrations: [tailwind()],
  output: 'static',
  vite: {
    plugins: [yaml()],
  },
});
