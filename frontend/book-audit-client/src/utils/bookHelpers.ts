import type { Book, BookFormData } from '../types/book'

export function isBookUnchanged(book: Book, formData: BookFormData): boolean {
  const normalize = (value: string | undefined) => (value ?? '').trim()
  const formAuthors = normalize(formData.authorNames)
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
    .sort()
  const bookAuthors = [...book.authors].sort()

  return (
    normalize(formData.title) === normalize(book.title) &&
    normalize(formData.shortDescription) === normalize(book.shortDescription ?? '') &&
    formData.publishDate === book.publishDate &&
    formAuthors.length === bookAuthors.length &&
    formAuthors.every((author, index) => author === bookAuthors[index])
  )
}
