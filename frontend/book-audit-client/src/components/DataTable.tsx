import { DataGrid } from '@mui/x-data-grid'
import type { DataGridProps } from '@mui/x-data-grid'

export function DataTable(props: DataGridProps) {
  return (
    <DataGrid
      {...props}
      disableRowSelectionOnClick
      sx={{ border: 0, ...props.sx }}
    />
  )
}