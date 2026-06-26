import { apiClient } from './client'
import type { Book, BookListRequest, PagedResult, CreateBookRequest, UpdateBookRequest } from '../types/book'

export const getBooks = async (request: BookListRequest): Promise<PagedResult<Book>> => {
  const params = new URLSearchParams()
  params.append('pageNumber', request.pageNumber.toString())
  params.append('pageSize', request.pageSize.toString())
  if (request.searchTerm) params.append('searchTerm', request.searchTerm)
  if (request.sortColumn) params.append('sortColumn', request.sortColumn)
  if (request.sortDirection) params.append('sortDirection', request.sortDirection)
  const response = await apiClient.get<PagedResult<Book>>(`/books?${params.toString()}`)
  return response.data
}

export const getBook = async (slug: string): Promise<Book> => {
  const response = await apiClient.get<Book>(`/books/${slug}`)
  return response.data
}

export const createBook = async (request: CreateBookRequest): Promise<Book> => {
  const response = await apiClient.post<Book>('/books', request)
  return response.data
}

export const updateBook = async (slug: string, request: UpdateBookRequest): Promise<Book> => {
  const response = await apiClient.put<Book>(`/books/${slug}`, request)
  return response.data
}

export const deleteBook = async (slug: string): Promise<void> => {
  await apiClient.delete(`/books/${slug}`)
}