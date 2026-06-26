import { Typography } from '@mui/material'
import { useParams } from 'react-router-dom'

export function BookDetailPage() {
  const { id } = useParams()
  return <Typography variant="h4">Book Detail: {id}</Typography>
}