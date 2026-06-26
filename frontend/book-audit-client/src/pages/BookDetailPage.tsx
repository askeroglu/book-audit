import { Box, Button, Chip, CircularProgress, Paper, Typography } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useBook, useBookHistory } from '../hooks/useBooks'
import { HistoryTimeline } from '../components/HistoryTimeline'
import { HistoryTable } from '../components/HistoryTable'

export function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const bookId = Number(id)

  const { data: book, isLoading: bookLoading } = useBook(bookId)
  const { data: history, isLoading: historyLoading } = useBookHistory(bookId)

  if (bookLoading) return <CircularProgress />

  return (
    <Box>
      <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
        Back
      </Button>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4">{book?.title}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {book?.author}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {book?.description}
        </Typography>
        <Chip label={book?.slug} sx={{ mt: 2 }} />
      </Paper>

      <Typography variant="h5" sx={{ mb: 2 }}>
        History
      </Typography>

      {historyLoading ? <CircularProgress /> : (
        <>
          <HistoryTimeline history={history ?? []} />
          <HistoryTable history={history ?? []} />
        </>
      )}
    </Box>
  )
}