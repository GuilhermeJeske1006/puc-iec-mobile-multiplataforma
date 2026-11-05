// lib/data/movie_repository.dart
//
// O REPOSITÓRIO é a "fonte da verdade" da lista de filmes: a UI nunca fala com a API direto.
// Offline-first = a tela mostra o que tem NO APARELHO primeiro e atualiza quando a rede deixa.
//
// TASK 13 (🧑‍💻 EM CASA · médio): cache-first — emitir o cache e, em seguida, o dado fresco.
// TASK 14 (🧑‍💻 EM CASA · médio): validade do cache (TTL) — não buscar de novo se ainda está fresco.
//
// Os testes estão em test/offline_test.dart (NÃO edite). Rode: flutter test test/offline_test.dart
import 'dart:convert';
import '../models/movie.dart';
import 'key_value_store.dart';
import 'remote_movie_source.dart';

/// Cache salvo no aparelho: a lista + QUANDO foi salva.
class CacheEntry {
  final DateTime savedAt;
  final List<Movie> movies;
  const CacheEntry(this.savedAt, this.movies);
}

enum CacheStatus { none, fresh, stale }

class MovieRepository {
  static const cacheKey = 'movies_cache_v1';

  final MovieSource remote;
  final KeyValueStore store;
  final Duration ttl; // quanto tempo o cache é considerado "fresco"
  final DateTime Function() now; // relógio injetável (os testes usam um relógio falso)

  MovieRepository({
    required this.remote,
    required this.store,
    this.ttl = const Duration(minutes: 10),
    DateTime Function()? now,
  }) : now = now ?? DateTime.now;

  // ── PRONTO: ler e gravar o cache (usa Movie.toJson/fromJson da TASK 12) ──────────────
  Future<CacheEntry?> readCache() async {
    final raw = await store.read(cacheKey);
    if (raw == null) return null;
    try {
      final j = json.decode(raw) as Map<String, dynamic>;
      return CacheEntry(
        DateTime.parse(j['savedAt'] as String),
        (j['movies'] as List).map((m) => Movie.fromJson(m as Map<String, dynamic>)).toList(),
      );
    } catch (_) {
      return null; // cache corrompido = como se não existisse
    }
  }

  Future<void> writeCache(List<Movie> movies) => store.write(
        cacheKey,
        json.encode({
          'savedAt': now().toIso8601String(),
          'movies': movies.map((m) => m.toJson()).toList(),
        }),
      );

  // ── TASK 14 — validade do cache · médio ─────────────────────────────────────────────
  // Devolva:
  //   CacheStatus.none  → não há cache;
  //   CacheStatus.fresh → o cache foi salvo há MENOS que `ttl`;
  //   CacheStatus.stale → o cache é mais velho que `ttl`.
  // Use `now()` (NÃO DateTime.now()) — é o que deixa o teste controlar o relógio.
  Future<CacheStatus> cacheStatus() async {
    final entry = await readCache();
    if (entry == null) return CacheStatus.none;
    return now().difference(entry.savedAt) < ttl ? CacheStatus.fresh : CacheStatus.stale;
  }

  // ── TASK 13 — cache-first (stale-while-revalidate) · médio ──────────────────────────
  // Hoje busca direto na API (e some offline). Faça assim:
  //   1. leia o cache (readCache) e, se existir, `yield` os filmes dele NA HORA;
  //   2. tente buscar na API (remote.fetchMovies()); se der certo: writeCache(...) e `yield` os frescos;
  //   3. se der OfflineException E já emitiu cache → engula o erro (a tela segue com o cache);
  //      se não havia cache → deixe o erro subir (a tela mostra "sem dados");
  //
  // Depois (TASK 14): se cacheStatus() == fresh, NÃO busque na API (já está atualizado).
  Stream<List<Movie>> watchMovies() async* {
    // 1. cache primeiro: a tela já tem o que mostrar, mesmo sem rede.
    final cached = await readCache();
    if (cached != null) yield cached.movies;

    // TASK 14: cache ainda fresco → nada a revalidar, nem chama a API.
    if (cached != null && await cacheStatus() == CacheStatus.fresh) return;

    // 2. revalida na API.
    final List<Movie> fresh;
    try {
      fresh = await remote.fetchMovies();
    } on OfflineException {
      // 3. sem rede: com cache, a tela segue com ele; sem cache, o erro sobe ("sem dados").
      if (cached == null) rethrow;
      return;
    }
    await writeCache(fresh);
    yield fresh;
  }
}
