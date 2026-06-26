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