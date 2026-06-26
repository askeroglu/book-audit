import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { historyApi } from '../api/history'
import type { HistoryQueryParams } from '../types/book'

export const historyQueryKey = (bookSlug: string) => ['history', bookSlug] as const

export function useBookHistory(bookSlug: string | undefined, params: HistoryQueryParams = {}) {
  return useQuery({
    queryKey: [...historyQueryKey(bookSlug ?? ''), params],
    queryFn: () => historyApi.getByBook(bookSlug!, params),
    enabled: !!bookSlug,
    placeholderData: keepPreviousData,
  })
}

export function useAllBookHistory(
  bookSlug: string | undefined,
  params: Omit<HistoryQueryParams, 'pageNumber' | 'pageSize'> = {}
) {
  return useQuery({
    queryKey: [...historyQueryKey(bookSlug ?? ''), 'all', params],
    queryFn: () => historyApi.getByBook(bookSlug!, { ...params, pageNumber: 1, pageSize: 1000 }),
    enabled: !!bookSlug,
  })
}