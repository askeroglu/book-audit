import { Box, Button, TextField } from '@mui/material'
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks } from '../hooks/useBooks'
import { DataTable } from '../components/DataTable'

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

  const { data, isLoading } = useBooks({
    pageNumber: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: search,
    sortColumn: sortModel[0]?.field,
    sortDirection: sortModel[0]?.sort ?? 'desc'
  })

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={() => navigate('/books/new')}>
          Add Book
        </Button>
      </Box>
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
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
    </Box>
  )
}