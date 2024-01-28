import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/post": "/posts",
  },
  integrations: [svelte(), mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
