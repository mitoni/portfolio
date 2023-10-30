import { z, defineCollection } from 'astro:content';

const projects = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        category: z.enum(["product", "software", "architecture", "experiment", "creative & web"]),
        subtitle: z.string(),
        cover: z.string(),
        order: z.number(),
        heroMesh: z.optional(z.string()),
        projectMesh: z.string(),
    })
})

export const collections = {
    projects
}
