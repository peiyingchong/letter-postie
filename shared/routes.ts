import { z } from 'zod';
import { insertLetterSchema, letters } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  letters: {
    create: {
      method: 'POST' as const,
      path: '/api/letters',
      input: insertLetterSchema,
      responses: {
        201: z.custom<typeof letters.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/letters/:shareId', // Use shareId for public access
      responses: {
        200: z.custom<typeof letters.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/letters/:id',
      input: insertLetterSchema.partial(),
      responses: {
        200: z.custom<typeof letters.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LetterInput = z.infer<typeof api.letters.create.input>;
export type LetterResponse = z.infer<typeof api.letters.create.responses[201]>;
