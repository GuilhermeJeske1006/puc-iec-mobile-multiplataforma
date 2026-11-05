// src/queries/movies/get-movie-by-id.ts
//
// CAMADA QUERIES — detalhe de 1 filme.
//
// Doc TanStack: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
//
// `movieByIdQueryOptions` centraliza key + fn + staleTime. É reusado por:
// - useMovieById (tela de detalhe)
// - usePrefetchMovie (MovieCard pré-carrega no pressIn → detalhe abre do cache)
// - aba Favoritos (useQueries pra buscar cada id salvo)

import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { api } from '@/services/api';
import type { Movie } from '@/types/movie';

const fetchMovieById = async (id: number) => {
  const res = await api.get<Movie>(`/movie/${id}`);
  return res.data;
};

export const movieByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieById(id),
    enabled: Number.isFinite(id),
    staleTime: 1000 * 60 * 10, // detalhe muda pouco → 10 min fresco
  });

export const useMovieById = (id: number) => useQuery(movieByIdQueryOptions(id));

/** Retorna fn que pré-carrega o detalhe no cache (no-op se já estiver fresco). */
export const usePrefetchMovie = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (id: number) => queryClient.prefetchQuery(movieByIdQueryOptions(id)),
    [queryClient]
  );
};
