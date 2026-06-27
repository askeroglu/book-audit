import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from "../api/books";
import type {
  BookListRequest,
  PagedResult,
  Book,
  BookFormData,
} from "../types/book";

export const useBooks = (request: BookListRequest) =>
  useQuery<PagedResult<Book>, Error>({
    queryKey: [
      "books",
      request.pageNumber,
      request.pageSize,
      request.searchTerm,
      request.sortColumn,
      request.sortDirection,
    ],
    queryFn: () => getBooks(request),
  });

export const useBook = (slug: string) =>
  useQuery<Book, Error>({
    queryKey: ["books", slug],
    queryFn: () => getBook(slug),
    enabled: !!slug,
  });

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, request }: { slug: string; request: BookFormData }) =>
      updateBook(slug, request),

    onMutate: async ({ slug, request }) => {
      await queryClient.cancelQueries({ queryKey: ["books", slug] });

      const previousBook = queryClient.getQueryData<Book>(["books", slug]);

      if (!previousBook) return { previousBook };

      const optimisticAuthors = request.authorNames
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      queryClient.setQueryData<Book>(["books", slug], {
        ...previousBook,
        title: request.title,
        shortDescription: request.shortDescription ?? null,
        publishDate: request.publishDate,
        authors: optimisticAuthors,
      });

      return { previousBook };
    },

    onError: (_err, variables, context) => {
      if (context?.previousBook) {
        queryClient.setQueryData(
          ["books", variables.slug],
          context.previousBook,
        );
      }
    },

    onSuccess: (updatedBook, variables) => {
      if (updatedBook.slug !== variables.slug) {
        queryClient.removeQueries({ queryKey: ["books", variables.slug] });
      }
      queryClient.setQueryData(["books", updatedBook.slug], updatedBook);
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBook,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["books"] });

      const previousQueries = queryClient.getQueriesData<PagedResult<Book>>({
        queryKey: ["books"],
      });

      previousQueries.forEach(([queryKey, data]) => {
        if (!data?.items) return;
        queryClient.setQueryData(queryKey, {
          ...data,
          items: data.items.filter((b) => b.id !== id),
          totalCount: Math.max(0, (data.totalCount ?? 0) - 1),
        });
      });

      return { previousQueries };
    },

    onError: (_err, _id, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
};
