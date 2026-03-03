import { defineCollection, z } from 'astro:content';

const altitudeEnum = z.enum([
  'foundations',
  'patterns',
  'advanced',
  'field-notes',
  'opinion',
]);

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date(),
    // Series & sequencing
    series: z.string().nullable(),
    seriesPart: z.number().int().min(1).nullable(),
    seriesTotal: z.number().int().min(1).nullable(),
    // Altitude (conceptual level)
    altitude: altitudeEnum,
    // Prerequisites — slugs of articles that should be read before this one
    prerequisites: z.array(z.string()).default([]),
    // Handoff — the slug of the next/prev article in sequence
    nextArticle: z.string().nullable(),
    prevArticle: z.string().nullable(),
    // Metadata
    readingTime: z.number().int().min(1),
    tags: z.array(z.string()).default([]),
    draft: z.boolean(),
    image: z.string().optional(),
  }),
});

export const collections = {
  blog,
};
