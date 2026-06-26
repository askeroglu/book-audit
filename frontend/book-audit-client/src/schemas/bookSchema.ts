import { z } from 'zod'

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(200),
  description: z.string().max(2000).optional()
})

export type BookFormData = z.infer<typeof bookSchema>