export interface Book {
  id: number
  title: string
  slug: string
  shortDescription: string | null
  publishDate: string
  createdAt: string
  authors: string[]
}

export interface BookFormData {
  title: string
  shortDescription?: string
  publishDate: string
  authorNames: string
}

export interface CreateBookRequest {
  title: string
  shortDescription?: string
  publishDate: string
  authorNames: string[]
}

export interface UpdateBookRequest {
  title: string
  shortDescription?: string
  publishDate: string
  authorNames: string[]
}

export interface BookListRequest {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  sortColumn?: string
  sortDirection?: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface BookHistoryEntry {
  id: number
  bookId: number
  changedAt: string
  action: string
  propertyName: string
  oldValue: string | null
  newValue: string | null
  description: string
}

export interface HistoryQueryParams {
  action?: string
  propertyName?: string
  sortBy?: string
  sortDescending?: boolean
  pageNumber?: number
  pageSize?: number
}