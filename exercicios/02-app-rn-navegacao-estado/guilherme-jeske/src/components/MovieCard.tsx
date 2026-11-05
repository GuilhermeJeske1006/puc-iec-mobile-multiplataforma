// src/components/MovieCard.tsx
//
// CAMADA COMPONENTS — componente reutilizável de card de filme.
// ATIVIDADE 2 — integrado com useFavoritesStore + HeartButton (Reanimated)
//
// O ❤️ fica FORA do Pressable de navegação (irmão, não filho): assim o tap no
// coração nunca dispara a navegação, sem depender de stopPropagation (que no
// web/nativo se comporta diferente).

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Movie } from '@/types/movie';
import { posterUrl } from '@/utils/poster-url';
import type { RootStackParamList } from '@/routes/RootStack';
import { useFavoritesStore } from '@/store/favoritesStore';
import { usePrefetchMovie } from '@/queries/movies/get-movie-by-id';
import HeartButton from './HeartButton';

type Props = { movie: Movie };

export default function MovieCard({ movie }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const prefetchMovie = usePrefetchMovie();
  const poster = posterUrl(movie.poster_path, 'w185');

  // Seletor retorna boolean → este card só re-renderiza quando o SEU estado muda,
  // não quando qualquer outro filme é favoritado.
  const isFav = useFavoritesStore((s) => s.isFavorite(movie.id));
  const toggle = useFavoritesStore((s) => s.toggle);

  return (
    <View style={styles.card}>
      <Pressable
        // Bônus: prefetch ANTES de navegar → o request corre durante a transição de tela
        // e o detalhe tende a abrir direto do cache. (No onPressIn dispararia em todo
        // gesto de scroll que começa em cima de um card.)
        onPress={() => {
          prefetchMovie(movie.id);
          navigation.navigate('Detail', { id: movie.id, title: movie.title });
        }}
        style={styles.main}
        accessibilityRole="button"
        accessibilityLabel={`Abrir detalhes de ${movie.title}`}
      >
        {poster && <Image source={{ uri: poster }} style={styles.poster} />}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {movie.title}
          </Text>
          <Text style={styles.meta}>⭐ {movie.vote_average.toFixed(1)}</Text>
        </View>
      </Pressable>

      <HeartButton active={isFav} onPress={() => toggle(movie.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 4,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  main: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  poster: { width: 60, height: 90, borderRadius: 4 },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', fontSize: 12 },
});
