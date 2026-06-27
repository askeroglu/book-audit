import { apiClient } from './client'
import type { Book, BookListRequest, PagedResult, CreateBookRequest, UpdateBookRequest, BookFormData } from '../types/book'

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

export const createBook = async (data: BookFormData): Promise<Book> => {
  const response = await apiClient.post<Book>('/books', toRequest(data))
  return response.data
}

export const updateBook = async (slug: string, data: BookFormData): Promise<Book> => {
  const response = await apiClient.put<Book>(`/books/${slug}`, toRequest(data))
  return response.data
}

export const deleteBook = async (id: number): Promise<void> => {
  await apiClient.delete(`/books/${id}`)
}

function toRequest(data: BookFormData): CreateBookRequest | UpdateBookRequest {
  return {
    title: data.title.trim(),
    shortDescription: data.shortDescription?.trim() || undefined,
    publishDate: data.publishDate,
    authorNames: data.authorNames
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
  }
}