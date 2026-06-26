import { AppBar, Box, Container, IconButton, Stack, Toolbar, Typography } from '@mui/material'
import { Outlet, useNavigate } from 'react-router-dom'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'

export function Layout() {
  const navigate = useNavigate()

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Stack
            direction="row"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer', alignItems: 'center' }}
          >
            <IconButton color="inherit" edge="start" sx={{ mr: 1 }}>
              <LibraryBooksIcon />
            </IconButton>
            <Typography variant="h6">Book Audit</Typography>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}