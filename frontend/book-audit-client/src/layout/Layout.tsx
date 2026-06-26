import { AppBar, Box, Container, Link, Toolbar, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { Link as RouterLink } from 'react-router-dom'
import MenuBookIcon from '@mui/icons-material/MenuBook'

export function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.dark' }}>
        <Toolbar>
          <MenuBookIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            <Link component={RouterLink} to="/" color="inherit" underline="none">
              Book Audit
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
