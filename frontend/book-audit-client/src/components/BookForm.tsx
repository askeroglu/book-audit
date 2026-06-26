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
        label="Author"
        {...register('author')}
        error={!!errors.author}
        helperText={errors.author?.message}
      />
      <TextField
        label="Description"
        {...register('description')}
        multiline
        rows={4}
        error={!!errors.description}
        helperText={errors.description?.message}
      />
    </Box>
  )
}