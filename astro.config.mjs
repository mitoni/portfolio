import { defineConfig, passthroughImageService } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    integrations: [
        svelte(),
        sitemap(),
    ],
    site: "https://www.mitonizzo.com",
    scopedStyleStrategy: "where",
    image: {
        service: passthroughImageService()
    },
});
