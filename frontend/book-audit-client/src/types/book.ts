export interface Book {
  id: number
  title: string
  author: string
  description?: string
  slug: string
  createdAt: string
}

export interface CreateBookRequest {
  title: string
  author: string
  description?: string
}

export interface UpdateBookRequest {
  title: string
  author: string
  description?: string
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