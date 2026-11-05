// lib/screens/home_screen.dart
//
// A lista já está pronta (usa o MovieCard).
// Ex2 (TASK 5): contador de favoritos no header.
// Ex2 (TASK 6): botão "limpar" favoritos.
// Ex5 (TASK 8): banner com Remote Config — ⏸ ADIADA (não faz parte desta atividade).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../state/favorites.dart';
import '../widgets/movie_list.dart';
import '../widgets/offline_banner.dart';
import '../widgets/offline_toggle.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Mesmo provider que o coração do card usa: favoritou lá → o número muda aqui.
    final count = ref.watch(favoritesProvider).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Filmes'),
        actions: [
          const OfflineToggle(), // modo avião simulado (pronto)
          IconButton(
            tooltip: 'Limpar favoritos',
            icon: const Icon(Icons.delete_outline),
            onPressed: count == 0 ? null : () => ref.read(favoritesProvider.notifier).clear(),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Center(child: Text('♥ $count')),
          ),
        ],
      ),
      body: const Column(
        children: [
          OfflineBanner(), // TASK 11 — aviso de offline
          Expanded(child: MovieList()), // lista vinda do repositório (cache-first)
        ],
      ),
    );
  }
}
