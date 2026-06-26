import { useRef } from 'react'
import Draggable from 'react-draggable'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper } from '@mui/material'
import type { PaperProps } from '@mui/material'
import { BookForm } from './BookForm'
import type { BookFormData } from '../schemas/bookSchema'

function DraggablePaper(props: PaperProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  return (
    <Draggable nodeRef={nodeRef} handle=".MuiDialogTitle-root" cancel=".MuiDialogContent-root">
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  )
}

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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperComponent={DraggablePaper}>
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