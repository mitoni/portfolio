import { defineConfig, passthroughImageService } from 'astro/config';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
    integrations: [
        svelte(),
    ],
    scopedStyleStrategy: "where",
    image: {
        service: passthroughImageService()
    },
});
