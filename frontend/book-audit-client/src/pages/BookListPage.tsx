import { Box, Button, IconButton, TextField } from '@mui/material'
import type { GridPaginationModel, GridSortModel, GridRenderCellParams } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook } from '../hooks/useBooks'
import { useSnackbar } from '../hooks/useSnackbar'
import { DataTable } from '../components/DataTable'
import { BookDialog } from '../components/BookDialog'
import type { BookFormData } from '../schemas/bookSchema'
import type { Book } from '../types/book'

const columns = [
  { field: 'title', headerName: 'Title', flex: 2 },
  { field: 'author', headerName: 'Author', flex: 1 },
  { field: 'createdAt', headerName: 'Created', flex: 1 }
]

export function BookListPage() {
  const navigate = useNavigate()
  const { showMessage } = useSnackbar()
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  const { data, isLoading, error } = useBooks({
    pageNumber: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: search,
    sortColumn: sortModel[0]?.field,
    sortDirection: sortModel[0]?.sort ?? 'desc'
  })

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

  const handleDelete = (book: Book) => {
    if (confirm('Are you sure you want to delete this book?')) {
      deleteBook.mutate(book.slug, {
        onSuccess: () => showMessage('Book deleted', 'success'),
        onError: () => showMessage('Failed to delete book', 'error')
      })
    }
  }

  const handleSubmit = (formData: BookFormData) => {
    if (editingBook) {
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

  const actionColumn = {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    renderCell: (params: GridRenderCellParams<Book>) => (
      <Box>
        <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(params.row); }}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(params.row); }}>
          <DeleteIcon />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd}>
          Add Book
        </Button>
      </Box>
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
      />
      <BookDialog
        open={dialogOpen}
        title={editingBook ? 'Edit Book' : 'Add Book'}
        submitLabel={editingBook ? 'Update' : 'Create'}
        defaultValues={editingBook ? { title: editingBook.title, author: editingBook.author, description: editingBook.description } : undefined}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}