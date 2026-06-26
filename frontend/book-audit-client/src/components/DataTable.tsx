import { Box } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { DataGridProps } from '@mui/x-data-grid'

interface DataTableProps extends DataGridProps {
  height?: number | string
}

export function DataTable({ height = 400, sx, ...props }: DataTableProps) {
  return (
    <Box sx={{ width: '100%', height }}>
      <DataGrid
        {...props}
        disableRowSelectionOnClick
        density="compact"
        sx={{ border: 0, ...sx }}
      />
    </Box>
  )
}
