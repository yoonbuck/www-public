import { z, defineCollection } from "astro:content";

export const ingredient = z.object({
  name: z.string(),
  detail: z.string().optional(),
  amount: z.string().optional(),
});

export const recipesCollection = defineCollection({
  type: "content",
  schema: z
    .object({
      title: z.string(),
      description: z.string().optional(),
      time: z.string().optional(),
      serves: z.coerce.string().optional(),
      ingredients: z.array(ingredient),
      source: z
        .object({
          name: z.string(),
          url: z.string().url().optional(),
        })
        .optional(),
    })
    .strict(),
});
