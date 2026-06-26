import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { BookForm } from './BookForm'
import type { BookFormData } from '../schemas/bookSchema'

interface BookDialogProps {
  open: boolean
  title: string
  submitLabel: string
  defaultValues?: BookFormData
  onClose: () => void
  onSubmit: (data: BookFormData) => void
}

export function BookDialog({ open, title, submitLabel, defaultValues, onClose, onSubmit }: BookDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <BookForm id="book-form" defaultValues={defaultValues} onSubmit={onSubmit} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="book-form" variant="contained">
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}