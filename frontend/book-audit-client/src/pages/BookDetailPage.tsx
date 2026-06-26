import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import type { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid'
import { DataTable } from '../components/DataTable'
import HistoryTimeline from '../components/HistoryTimeline'
import { BookDialog } from '../components/BookDialog'
import { useBook, useUpdateBook } from '../hooks/useBooks'
import { useBookHistory, useAllBookHistory } from '../hooks/useBookHistory'
import { useSnackbar } from '../hooks/useSnackbar'
import type { BookFormData } from '../schemas/bookSchema'
import type { BookHistoryEntry } from '../types/book'

const historyColumns: GridColDef<BookHistoryEntry>[] = [
  {
    field: 'changedAt',
    headerName: 'Changed At',
    width: 190,
    sortable: true,
    valueFormatter: (value: string) => new Date(value).toLocaleString()
  },
  { field: 'action', headerName: 'Action', width: 140, sortable: true },
  { field: 'propertyName', headerName: 'Property', width: 160, sortable: true },
  { field: 'description', headerName: 'Description', flex: 1, sortable: false }
]

const actionOptions = [
  { value: 'All', label: 'All' },
  { value: 'Created', label: 'Created' },
  { value: 'Updated', label: 'Updated' },
  { value: 'Deleted', label: 'Deleted' },
  { value: 'AuthorAdded', label: 'Author Added' },
  { value: 'AuthorRemoved', label: 'Author Removed' }
]

export function BookDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { showMessage } = useSnackbar()
  const { data: book, isLoading: bookLoading, error: bookError } = useBook(slug ?? '')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const [actionFilter, setActionFilter] = useState('All')
  const [propertyFilter, setPropertyFilter] = useState('All')

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [sortModel, setSortModel] = useState<GridSortModel>([])

  const updateBook = useUpdateBook()

  const historyFilters = {
    action: actionFilter === 'All' ? undefined : actionFilter,
    propertyName: propertyFilter === 'All' ? undefined : propertyFilter,
    sortBy: sortModel[0]?.field,
    sortDescending: sortModel[0]?.sort === 'desc'
  }

  const { data: history, isLoading: historyLoading } = useBookHistory(slug ?? '', {
    ...historyFilters,
    pageNumber: paginationModel.page + 1,
    pageSize: paginationModel.pageSize
  })

  const { data: allHistory } = useAllBookHistory(slug ?? '', historyFilters)

  useEffect(() => {
    if (bookError) showMessage('Failed to load book details', 'error')
  }, [bookError, showMessage])

  const handleSubmit = (formData: BookFormData) => {
    if (!book) return
    updateBook.mutate({ slug: book.slug, request: formData }, {
      onSuccess: (updatedBook) => {
        showMessage('Book updated', 'success')
        setDialogOpen(false)
        if (updatedBook.slug !== slug) {
          navigate(`/books/${updatedBook.slug}`, { replace: true })
        }
      },
      onError: () => showMessage('Failed to update book', 'error')
    })
  }

  if (bookLoading) return <CircularProgress />

  if (!book) {
    return <Typography color="error">Book not found.</Typography>
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setDialogOpen(true)}>
          Edit
        </Button>
      </Stack>

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
            {book.title}
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body1" color="text.secondary" sx={{ minWidth: 90 }}>
                Authors
              </Typography>
              {book.authors.map((author) => (
                <Chip key={author} label={author} size="small" color="primary" variant="outlined" />
              ))}
            </Stack>
            <Divider />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ minWidth: 90 }}>
                Published
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {book.publishDate}
              </Typography>
            </Stack>
            {book.shortDescription && (
              <>
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  {book.shortDescription}
                </Typography>
              </>
            )}
            <Chip label={book.slug} sx={{ alignSelf: 'flex-start' }} />
          </Stack>
        </CardContent>
      </Card>

      <Paper sx={{ borderRadius: 2, boxShadow: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="History Timeline" />
          <Tab label="History List" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && <HistoryTimeline entries={allHistory?.items ?? []} />}

          {tab === 1 && (
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 160 }} size="small">
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={actionFilter}
                    label="Action"
                    onChange={(e) => {
                      setActionFilter(e.target.value)
                      setPaginationModel((p) => ({ ...p, page: 0 }))
                    }}
                  >
                    {actionOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 160 }} size="small">
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={propertyFilter}
                    label="Property"
                    onChange={(e) => {
                      setPropertyFilter(e.target.value)
                      setPaginationModel((p) => ({ ...p, page: 0 }))
                    }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Book">Book</MenuItem>
                    <MenuItem value="Title">Title</MenuItem>
                    <MenuItem value="ShortDescription">Short Description</MenuItem>
                    <MenuItem value="PublishDate">Publish Date</MenuItem>
                    <MenuItem value="Authors">Authors</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <DataTable
                rows={history?.items ?? []}
                columns={historyColumns}
                rowCount={history?.totalCount ?? 0}
                loading={historyLoading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25]}
                paginationMode="server"
                sortingMode="server"
                sortModel={sortModel}
                onSortModelChange={setSortModel}
              />
            </Box>
          )}
        </Box>
      </Paper>

      <BookDialog
        open={dialogOpen}
        title="Edit Book"
        submitLabel="Update"
        defaultValues={{
          title: book.title,
          shortDescription: book.shortDescription ?? '',
          publishDate: book.publishDate,
          authorNames: book.authors.join(', ')
        }}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}