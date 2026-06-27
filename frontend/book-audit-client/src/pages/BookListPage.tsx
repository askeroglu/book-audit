import { Box, Button, DialogActions, DialogContent, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material'
import { GridActionsCellItem } from '@mui/x-data-grid'
import type { GridPaginationModel, GridSortModel, GridRowParams, GridColDef } from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import HistoryIcon from '@mui/icons-material/History'
import SearchIcon from '@mui/icons-material/Search'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook } from '../hooks/useBooks'
import { useAllBookHistory } from '../hooks/useBookHistory'
import { useSnackbar } from '../hooks/useSnackbar'
import { DataTable } from '../components/DataTable'
import { BookDialog } from '../components/BookDialog'
import { DraggableDialog, DraggableDialogTitle } from '../components/DraggableDialog'
import HistoryTimeline from '../components/HistoryTimeline'
import type { BookFormData } from '../schemas/bookSchema'
import type { Book } from '../types/book'
import { isBookUnchanged } from '../utils/bookHelpers'

const columns: GridColDef<Book>[] = [
  { field: 'title', headerName: 'Title', flex: 1, sortable: true },
  { field: 'authors', headerName: 'Authors', flex: 1, sortable: true, valueGetter: (value: string[]) => value.join(', ') },
  { field: 'publishDate', headerName: 'Published', width: 120, sortable: true },
  {
    field: 'createdAt',
    headerName: 'Created',
    width: 120,
    sortable: true,
    valueFormatter: (value: string) => new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
]

export function BookListPage() {
  const navigate = useNavigate()
  const { showMessage } = useSnackbar()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; book: Book | null }>({ open: false, book: null })

  useEffect(() => {
    const trimmed = search.trim()
    const timer = setTimeout(
      () => setDebouncedSearch(trimmed.length === 0 || trimmed.length >= 3 ? trimmed : ''),
      300
    )
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, error } = useBooks({
    pageNumber: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: debouncedSearch,
    sortColumn: sortModel[0]?.field,
    sortDirection: sortModel[0]?.sort ?? 'desc'
  })

  const { data: history } = useAllBookHistory(historyDialog.book?.slug ?? '', {})

  const createBook = useCreateBook()
  const updateBook = useUpdateBook()
  const deleteBook = useDeleteBook()

  useEffect(() => {
    if (error) showMessage('Failed to load books', 'error')
  }, [error, showMessage])

  const handleAdd = () => {
    setEditingBook(null)
    setDialogOpen(true)
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setDialogOpen(true)
  }

  const handleHistory = (book: Book) => {
    setHistoryDialog({ open: true, book })
  }

  const handleCloseHistory = () => {
    setHistoryDialog({ open: false, book: null })
  }

  const handleDelete = (book: Book) => {
    if (confirm('Are you sure you want to delete this book?')) {
      deleteBook.mutate(book.id, {
        onSuccess: () => showMessage('Book deleted', 'success'),
        onError: () => showMessage('Failed to delete book', 'error')
      })
    }
  }

  const handleSubmit = (formData: BookFormData) => {
    if (editingBook) {
      if (isBookUnchanged(editingBook, formData)) {
        setDialogOpen(false)
        return
      }
      updateBook.mutate({ slug: editingBook.slug, request: formData }, {
        onSuccess: () => {
          showMessage('Book updated', 'success')
          setDialogOpen(false)
        },
        onError: () => showMessage('Failed to update book', 'error')
      })
    } else {
      createBook.mutate(formData, {
        onSuccess: () => {
          showMessage('Book created', 'success')
          setDialogOpen(false)
        },
        onError: () => showMessage('Failed to create book', 'error')
      })
    }
  }

  const actionColumn: GridColDef<Book> = {
    field: 'actions',
    headerName: 'Actions',
    width: 130,
    sortable: false,
    type: 'actions',
    getActions: (params: GridRowParams<Book>) => {
      const currentRow = data?.items.find((b) => b.id === params.id)
      if (!currentRow) return []

      return [
        <GridActionsCellItem
          key="history"
          icon={<HistoryIcon />}
          label="History"
          onClick={(e) => { e.stopPropagation(); handleHistory(currentRow) }}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={(e) => { e.stopPropagation(); handleEdit(currentRow) }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={(e) => { e.stopPropagation(); handleDelete(currentRow) }}
        />
      ]
    }
  }

  return (
    <Box>
      <Paper
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 2,
          boxShadow: 2,
          background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)'
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
            Books
          </Typography>
          <TextField
            placeholder="Search by title, description or authors (min 3 chars)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add Book
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: '#fafbfc' }}>
        <DataTable
          rows={data?.items ?? []}
          columns={[...columns, actionColumn]}
          rowCount={data?.totalCount ?? 0}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          paginationMode="server"
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          onRowClick={(params) => navigate(`/books/${params.row.slug}`)}
          height={600}
        />
      </Paper>

      <BookDialog
        open={dialogOpen}
        title={editingBook ? 'Edit Book' : 'Add Book'}
        submitLabel={editingBook ? 'Update' : 'Create'}
        defaultValues={editingBook ? {
          title: editingBook.title,
          shortDescription: editingBook.shortDescription ?? '',
          publishDate: editingBook.publishDate,
          authorNames: editingBook.authors.join(', ')
        } : undefined}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
      <DraggableDialog open={historyDialog.open} onClose={handleCloseHistory} fullWidth maxWidth="sm">
        <DraggableDialogTitle onClose={handleCloseHistory}>
          History — {historyDialog.book?.title}
        </DraggableDialogTitle>
        <DialogContent>
          <HistoryTimeline entries={history?.items ?? []} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistory}>Close</Button>
        </DialogActions>
      </DraggableDialog>
    </Box>
  )
}
