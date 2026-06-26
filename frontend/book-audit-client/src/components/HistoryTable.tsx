import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import type { GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid'
import { useState } from 'react'
import { DataTable } from './DataTable'
import type { BookHistory } from '../types/book'

interface HistoryTableProps {
  history: BookHistory[]
}

export function HistoryTable({ history }: HistoryTableProps) {
  const [actionFilter, setActionFilter] = useState('')
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 5 })

  const filtered = history.filter(h => {
    const matchesAction = !actionFilter || h.action === actionFilter
    const matchesSearch = !search || (h.changes && h.changes.toLowerCase().includes(search.toLowerCase()))
    return matchesAction && matchesSearch
  })

  const columns = [
    { field: 'action', headerName: 'Action', width: 120 },
    { field: 'changes', headerName: 'Changes', flex: 1, minWidth: 300 },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      width: 200,
      renderCell: (params: GridRenderCellParams<BookHistory>) =>
        new Date(params.value as string).toLocaleString()
    }
  ]

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Action</InputLabel>
          <Select value={actionFilter} label="Action" onChange={(e) => setActionFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Created">Created</MenuItem>
            <MenuItem value="Updated">Updated</MenuItem>
            <MenuItem value="Deleted">Deleted</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Search changes" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Box>
      <DataTable
        rows={filtered}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25]}
      />
    </Box>
  )
}