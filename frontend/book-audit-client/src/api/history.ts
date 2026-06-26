import { apiClient } from './client'
import type { BookHistoryEntry, HistoryQueryParams, PagedResult } from '../types/book'

export const historyApi = {
  getByBook: (bookSlug: string, params: HistoryQueryParams) =>
    apiClient
      .get<PagedResult<BookHistoryEntry>>(`/books/${bookSlug}/history`, { params })
      .then((r) => r.data),
}