// lib/widgets/offline_banner.dart
//
// TASK 11 (🧑‍💻 EM CASA · fácil): mostre um aviso quando NÃO há conexão.
//
//   1. vire `ConsumerWidget` (build(context, ref)) e importe o flutter_riverpod;
//   2. leia `final online = ref.watch(onlineProvider);` (de '../state/network.dart');
//   3. se online → devolva `const SizedBox.shrink()` (nada na tela);
//      se offline → um Container no topo com o texto EXATO:
//        'Você está offline — mostrando dados salvos'
//
// O teste está em test/offline_test.dart (NÃO edite).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../state/network.dart';
import '../theme/app_theme.dart';

class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final online = ref.watch(onlineProvider);
    if (online) return const SizedBox.shrink(); // com conexão: nada na tela

    // sem conexão: faixa âmbar no topo (texto escuro, legível sobre o tema dark)
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: AppColors.amber,
      child: const Row(
        children: [
          Icon(Icons.cloud_off, size: 18, color: AppColors.bg),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'Você está offline — mostrando dados salvos',
              style: TextStyle(color: AppColors.bg, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
