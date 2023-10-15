import { z, defineCollection } from 'astro:content';

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        category: z.enum(["product", "software", "architecture", "experiment"]),
        subtitle: z.string(),
        mesh: z.string()
    })
})

export const collections = {
    projects
}
