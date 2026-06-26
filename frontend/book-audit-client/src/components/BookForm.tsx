import { Box, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookSchema, type BookFormData } from '../schemas/bookSchema'

interface BookFormProps {
  id: string
  defaultValues?: BookFormData
  onSubmit: (data: BookFormData) => void
}

export function BookForm({ id, defaultValues, onSubmit }: BookFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <Box
      component="form"
      id={id}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
    >
      <TextField
        label="Title"
        {...register('title')}
        error={!!errors.title}
        helperText={errors.title?.message}
      />
      <TextField
        label="Short Description"
        {...register('shortDescription')}
        multiline
        rows={4}
        error={!!errors.shortDescription}
        helperText={errors.shortDescription?.message}
      />
      <TextField
        label="Publish Date"
        type="date"
        {...register('publishDate')}
        error={!!errors.publishDate}
        helperText={errors.publishDate?.message}
        slotProps={{
          input: { inputProps: { max: today } },
          inputLabel: { shrink: true }
        }}
      />
      <TextField
        label="Authors"
        {...register('authorNames')}
        error={!!errors.authorNames}
        helperText={errors.authorNames?.message || 'Separate authors with commas'}
      />
    </Box>
  )
}