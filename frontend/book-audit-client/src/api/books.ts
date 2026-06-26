import { apiClient } from './client'
import type { Book, CreateBookRequest, UpdateBookRequest } from '../types/book'

export const getBooks = async (): Promise<Book[]> => {
  const response = await apiClient.get<Book[]>('/books')
  return response.data
}

export const getBook = async (id: number): Promise<Book> => {
  const response = await apiClient.get<Book>(`/books/${id}`)
  return response.data
}

export const createBook = async (request: CreateBookRequest): Promise<Book> => {
  const response = await apiClient.post<Book>('/books', request)
  return response.data
}

export const updateBook = async (id: number, request: UpdateBookRequest): Promise<Book> => {
  const response = await apiClient.put<Book>(`/books/${id}`, request)
  return response.data
}

export const deleteBook = async (id: number): Promise<void> => {
  await apiClient.delete(`/books/${id}`)
}