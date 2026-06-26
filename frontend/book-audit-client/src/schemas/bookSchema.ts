import { z } from 'zod'
import dayjs from 'dayjs'

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  shortDescription: z.string().max(1000, 'Description is too long').optional(),
  publishDate: z
    .string()
    .min(1, 'Publish date is required')
    .refine(
      (date) => !dayjs(date).isAfter(dayjs(), 'day'),
      { message: 'Publish date cannot be in the future' }
    ),
  authorNames: z.string().min(1, 'At least one author is required')
})

export type BookFormData = z.infer<typeof bookSchema>