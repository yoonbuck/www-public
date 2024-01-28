import { z, defineCollection } from "astro:content";

export const postsCollection = defineCollection({
  type: "content",
  schema: z
    .object({
      title: z.string(),
      date: z.date(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .strict(),
});
