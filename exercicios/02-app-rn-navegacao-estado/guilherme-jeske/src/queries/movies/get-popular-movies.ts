// src/queries/movies/get-popular-movies.ts
//
// CAMADA QUERIES — gerencia cache + ciclo de vida dos dados do servidor.
// "Como gerenciar o ciclo de vida dos dados"
//
// HANDS-ON AULA 2 — Passo 4 (TanStack Query) + BÔNUS TASK 10 (paginação infinita)
//
// Doc TanStack: https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries
//
// Conceitos:
// - queryKey = identidade do cache (TanStack dedupe + invalidate por essa key)
// - queryFn = função pura que retorna Promise<dados>
// - staleTime = quanto tempo cache fica fresco antes de refetch background
// - getNextPageParam = lê page/total_pages da resposta TMDB; undefined = acabou

import { useCallback } from 'react';
import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { MoviesResponse } from '@/types/movie';

const POPULAR_MOVIES_KEY = ['movies', 'popular'] as const;

// TMDB reporta total_pages na casa das dezenas de milhares, mas rejeita page > 500.
const TMDB_MAX_PAGE = 500;

export const fetchPopularMovies = async (page = 1) => {
  const res = await api.get<MoviesResponse>('/movie/popular', { params: { page } });
  return res.data;
};

export const usePopularMovies = () =>
  useInfiniteQuery({
    queryKey: POPULAR_MOVIES_KEY,
    queryFn: ({ pageParam }) => fetchPopularMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < Math.min(last.total_pages, TMDB_MAX_PAGE) ? last.page + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

/**
 * Pull-to-refresh: `refetch()` de uma infinite query rebusca TODAS as páginas carregadas,
 * em sequência. Aqui mantemos só a 1ª página no cache e rebuscamos ela — padrão
 * recomendado pelo TanStack pra "voltar ao topo" com dados frescos.
 */
export const useRefreshPopularMovies = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.setQueryData<InfiniteData<MoviesResponse, number>>(POPULAR_MOVIES_KEY, (d) =>
      d ? { pages: d.pages.slice(0, 1), pageParams: d.pageParams.slice(0, 1) } : d
    );
    return queryClient.refetchQueries({ queryKey: POPULAR_MOVIES_KEY, exact: true });
  }, [queryClient]);
};
