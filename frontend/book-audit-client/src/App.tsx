import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './layout/Layout'
import { BookListPage } from './pages/BookListPage'
import { BookDetailPage } from './pages/BookDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <BookListPage /> },
      { path: 'books/:slug', element: <BookDetailPage /> }
    ]
  }
])