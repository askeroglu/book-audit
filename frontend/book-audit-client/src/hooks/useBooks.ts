import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBooks, getBook, createBook, updateBook, deleteBook, getBookHistory } from '../api/books'
import type { BookListRequest, PagedResult, Book, UpdateBookRequest, BookHistory } from '../types/book'

export const useBooks = (request: BookListRequest) =>
  useQuery<PagedResult<Book>, Error>({
    queryKey: ['books', request],
    queryFn: () => getBooks(request)
  })

export const useBook = (id: number) =>
  useQuery<Book, Error>({
    queryKey: ['books', id],
    queryFn: () => getBook(id),
    enabled: id > 0
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
    mutationFn: ({ id, request }: { id: number; request: UpdateBookRequest }) =>
      updateBook(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['books', variables.id] })
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

export const useBookHistory = (bookId: number) =>
  useQuery<BookHistory[], Error>({
    queryKey: ['bookHistory', bookId],
    queryFn: () => getBookHistory(bookId),
    enabled: bookId > 0
  })