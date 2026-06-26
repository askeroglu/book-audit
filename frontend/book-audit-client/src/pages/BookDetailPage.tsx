import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
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
import type { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid'
import { DataTable } from '../components/DataTable'
import HistoryTimeline from '../components/HistoryTimeline'
import { useBook } from '../hooks/useBooks'
import { useBookHistory, useAllBookHistory } from '../hooks/useBookHistory'
import { useSnackbar } from '../hooks/useSnackbar'
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
  { value: 'Deleted', label: 'Deleted' }
]

export function BookDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { showMessage } = useSnackbar()
  const { data: book, isLoading: bookLoading, error: bookError } = useBook(slug ?? '')

  const [tab, setTab] = useState(0)
  const [actionFilter, setActionFilter] = useState('All')
  const [propertyFilter, setPropertyFilter] = useState('All')

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [sortModel, setSortModel] = useState<GridSortModel>([])

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel(model)
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

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

  if (bookLoading) return <Typography>Loading...</Typography>

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
      </Stack>

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            {book.title}
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body1" color="text.secondary" sx={{ minWidth: 90 }}>
                Author
              </Typography>
              <Chip label={book.author} size="small" color="primary" variant="outlined" />
            </Stack>
            <Divider />
            {book.description && (
              <Typography variant="body2" color="text.secondary">
                {book.description}
              </Typography>
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
                    <MenuItem value="Author">Author</MenuItem>
                    <MenuItem value="Description">Description</MenuItem>
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
                onSortModelChange={handleSortModelChange}
              />
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  )
}