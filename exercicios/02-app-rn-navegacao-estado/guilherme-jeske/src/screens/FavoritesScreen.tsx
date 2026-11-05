// src/screens/FavoritesScreen.tsx
//
// BÔNUS — aba Favoritos.
//
// O store guarda só os ids (persistidos no MMKV). Os dados de cada filme vêm do
// TanStack Query via useQueries — se o filme já foi aberto/pré-carregado, sai do cache.

import { useQueries } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import MovieCard from '@/components/MovieCard';
import TokenMissingScreen from '@/components/TokenMissingScreen';
import { movieByIdQueryOptions } from '@/queries/movies/get-movie-by-id';
import { isTokenError, isTokenMissing } from '@/services/api';
import { isStoragePersistent } from '@/storage/mmkv';
import { useFavoritesStore } from '@/store/favoritesStore';
import type { Movie } from '@/types/movie';

export default function FavoritesScreen() {
  const ids = useFavoritesStore((s) => s.ids);
  const clear = useFavoritesStore((s) => s.clear);

  const results = useQueries({ queries: ids.map((id) => movieByIdQueryOptions(id)) });
  const movies = results.map((r) => r.data).filter((m): m is Movie => !!m);
  const pending = results.some((r) => r.isLoading);
  const failed = results.filter((r) => r.isError && !r.data);

  if (isTokenMissing || failed.some((r) => isTokenError(r.error))) return <TokenMissingScreen />;

  return (
    <FlatList
      data={movies}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <MovieCard movie={item} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.count}>
            {ids.length} {ids.length === 1 ? 'favorito' : 'favoritos'}
          </Text>
          {ids.length > 0 && (
            <Pressable onPress={clear} style={styles.clearBtn} accessibilityRole="button">
              <Text style={styles.clearText}>Limpar</Text>
            </Pressable>
          )}
        </View>
      }
      ListFooterComponent={
        <>
          {pending && <ActivityIndicator style={styles.pad} />}
          {failed.length > 0 && (
            <Pressable
              onPress={() => failed.forEach((r) => r.refetch())}
              style={styles.pad}
              accessibilityRole="button"
            >
              <Text style={styles.error}>
                Não consegui carregar {failed.length}{' '}
                {failed.length === 1 ? 'favorito' : 'favoritos'}. Toque pra tentar de novo.
              </Text>
            </Pressable>
          )}
          {!isStoragePersistent && (
            <Text style={styles.warn}>
              ⚠️ MMKV nativo indisponível (Expo Go): favoritos em memória, somem ao recarregar.
              Use um dev build (npx expo run:ios / run:android) pra persistir.
            </Text>
          )}
        </>
      }
      ListEmptyComponent={
        pending || failed.length > 0 ? null : (
          <Text style={styles.empty}>Nenhum favorito ainda. Toque no 🤍 de um filme.</Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f6f6f6',
  },
  count: { fontSize: 14, fontWeight: '600' },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fde2e2' },
  clearText: { color: '#b00020', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#666', padding: 32 },
  pad: { paddingVertical: 16 },
  error: { color: '#b00020', textAlign: 'center', paddingHorizontal: 12 },
  warn: { color: '#cc6600', fontSize: 12, padding: 12, textAlign: 'center' },
});
