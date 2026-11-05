// Ex3 · TASK 9 — teste autoral do `favoritesProvider` ISOLADO (sem UI, sem Firestore).
//
// ProviderContainer = um "mini-app" só com os providers: dá pra ler o estado e chamar as
// ações do notifier sem montar nenhuma tela. Sem `Firebase.initializeApp`, o provider
// funciona só em memória (exatamente o comportamento local do TASK 2).

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:filmes_flutter/state/favorites.dart';

void main() {
  late ProviderContainer c;

  setUp(() {
    c = ProviderContainer();
    addTearDown(c.dispose);
  });

  test('favoritos: começa vazio → toggle adiciona → toggle remove → clear esvazia', () {
    expect(c.read(favoritesProvider), isEmpty);

    c.read(favoritesProvider.notifier).toggle(1);
    expect(c.read(favoritesProvider).contains(1), isTrue);

    c.read(favoritesProvider.notifier).toggle(1); // de novo → desfavorita
    expect(c.read(favoritesProvider).contains(1), isFalse);
    expect(c.read(favoritesProvider), isEmpty);

    c.read(favoritesProvider.notifier)
      ..toggle(1)
      ..toggle(2)
      ..toggle(3);
    expect(c.read(favoritesProvider), {1, 2, 3});

    c.read(favoritesProvider.notifier).clear();
    expect(c.read(favoritesProvider), isEmpty);
  });

  test('toggle de um filme não mexe nos outros', () {
    final fav = c.read(favoritesProvider.notifier);
    fav
      ..toggle(10)
      ..toggle(20)
      ..toggle(10); // tira só o 10
    expect(c.read(favoritesProvider), {20});
  });

  test('cada mudança gera um NOVO Set e avisa quem está ouvindo (imutável)', () {
    final emitted = <Set<int>>[];
    c.listen<Set<int>>(favoritesProvider, (_, next) => emitted.add(next));

    final before = c.read(favoritesProvider);
    c.read(favoritesProvider.notifier).toggle(7);
    final after = c.read(favoritesProvider);

    expect(identical(before, after), isFalse, reason: 'state = {...} cria outro Set');
    expect(before, isEmpty, reason: 'o Set antigo não foi mutado');

    c.read(favoritesProvider.notifier).clear();
    expect(emitted, [
      {7},
      <int>{},
    ]);
  });
}
