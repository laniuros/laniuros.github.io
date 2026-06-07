import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const publications = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/publications" }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        }),
      )
      .default([]),
    featured: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const recommendations = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/recommendations" }),
  schema: z.object({
    title: z.string(),
    category: z.enum(["game", "book", "film"]),
    note: z.string(),
  }),
});

export const collections = { publications, blog, recommendations };
