// src/screens/MovieList.tsx
//
// CAMADA SCREENS — UI pura. Consome queries + components.
// "Screen não deveria saber COMO buscar dados. Só renderiza estados da UI."
//
// HANDS-ON AULA 2 — Passo 5 (FlatList + usePopularMovies)
// ATIVIDADE 2 — MovieCard com favoritar
// BÔNUS TASK 10 — paginação infinita (useInfiniteQuery + onEndReached)

import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePopularMovies, useRefreshPopularMovies } from '@/queries/movies/get-popular-movies';
import { useCounterStore } from '@/store/counterStore';
import { isTokenError, isTokenMissing } from '@/services/api';
import TokenMissingScreen from '@/components/TokenMissingScreen';
import MovieCard from '@/components/MovieCard';
import type { Movie } from '@/types/movie';

function CounterHeader() {
  const count = useCounterStore((s) => s.count);
  const increment = useCounterStore((s) => s.increment);
  const decrement = useCounterStore((s) => s.decrement);
  const reset = useCounterStore((s) => s.reset);

  return (
    <View style={styles.counter}>
      <Text style={styles.counterText}>Counter: {count}</Text>
      <Pressable onPress={decrement} style={styles.counterBtn} accessibilityLabel="Decrementar">
        <Text>−</Text>
      </Pressable>
      <Pressable onPress={increment} style={styles.counterBtn} accessibilityLabel="Incrementar">
        <Text>+</Text>
      </Pressable>
      <Pressable onPress={reset} style={styles.counterBtn} accessibilityLabel="Zerar">
        <Text>↺</Text>
      </Pressable>
    </View>
  );
}

export default function MovieList() {
  const {
    data,
    isLoading,
    error,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = usePopularMovies();
  const refresh = useRefreshPopularMovies();

  // Junta as páginas e remove duplicados: a lista "popular" do TMDB muda entre
  // requests, então o mesmo filme pode aparecer em duas páginas (key duplicada).
  const movies = useMemo(() => {
    const seen = new Set<number>();
    const out: Movie[] = [];
    for (const page of data?.pages ?? []) {
      for (const m of page.results) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          out.push(m);
        }
      }
    }
    return out;
  }, [data]);

  // Tela amigável quando token TMDB não foi configurado ou está inválido.
  if (isTokenMissing || isTokenError(error)) {
    return <TokenMissingScreen />;
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Tela de erro só quando NÃO há nada carregado. Se a falha foi ao buscar a próxima
  // página (ou num refetch em background), as páginas já carregadas continuam na tela.
  if (error && !data) {
    return (
      <View style={styles.center}>
        <Text>Erro: {String(error)}</Text>
        <Pressable onPress={refresh} style={styles.retryBtn} accessibilityRole="button">
          <Text>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={movies}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <MovieCard movie={item} />}
      ListHeaderComponent={CounterHeader}
      onRefresh={refresh}
      refreshing={isRefetching && !isFetchingNextPage}
      onEndReached={() => {
        // Não insiste sozinho depois de erro: usuário tenta de novo pelo footer.
        if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={styles.footer} />
        ) : isFetchNextPageError ? (
          <Pressable onPress={() => fetchNextPage()} style={styles.footer} accessibilityRole="button">
            <Text style={styles.footerError}>Falha ao carregar mais filmes. Toque pra tentar de novo.</Text>
          </Pressable>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f6f6f6',
  },
  counterText: { flex: 1, fontSize: 14, fontWeight: '600' },
  counterBtn: {
    minWidth: 32,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#e4e4e4',
  },
  footer: { paddingVertical: 16 },
  footerError: { textAlign: 'center', color: '#b00020' },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#e4e4e4',
  },
});
