import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBooks, getBook, createBook, updateBook, deleteBook } from '../api/books'
import type { BookListRequest, PagedResult, Book, BookFormData } from '../types/book'

export const useBooks = (request: BookListRequest) =>
  useQuery<PagedResult<Book>, Error>({
    queryKey: [
      'books',
      request.pageNumber,
      request.pageSize,
      request.searchTerm,
      request.sortColumn,
      request.sortDirection
    ],
    queryFn: () => getBooks(request)
  })

export const useBook = (slug: string) =>
  useQuery<Book, Error>({
    queryKey: ['books', slug],
    queryFn: () => getBook(slug),
    enabled: !!slug
  })

export const useCreateBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    }
  })
}

export const useUpdateBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, request }: { slug: string; request: BookFormData }) =>
      updateBook(slug, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['books', variables.slug] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
    }
  })
}

export const useDeleteBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    }
  })
}