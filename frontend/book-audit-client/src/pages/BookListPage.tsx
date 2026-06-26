import { Box, Button, IconButton, TextField } from '@mui/material'
import type { GridPaginationModel, GridSortModel, GridRenderCellParams } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks, useCreateBook, useUpdateBook } from '../hooks/useBooks'
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
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  const { data, isLoading } = useBooks({
    pageNumber: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: search,
    sortColumn: sortModel[0]?.field,
    sortDirection: sortModel[0]?.sort ?? 'desc'
  })

  const createBook = useCreateBook()
  const updateBook = useUpdateBook()

  const handleAdd = () => {
    setEditingBook(null)
    setDialogOpen(true)
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setDialogOpen(true)
  }

  const handleSubmit = (formData: BookFormData) => {
    if (editingBook) {
      updateBook.mutate({ id: editingBook.id, request: formData }, {
        onSuccess: () => setDialogOpen(false)
      })
    } else {
      createBook.mutate(formData, {
        onSuccess: () => setDialogOpen(false)
      })
    }
  }

  const actionColumn = {
    field: 'actions',
    headerName: 'Actions',
    width: 80,
    sortable: false,
    renderCell: (params: GridRenderCellParams<Book>) => (
      <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(params.row); }}>
        <EditIcon />
      </IconButton>
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
        onRowClick={(params) => navigate(`/books/${params.id}`)}
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