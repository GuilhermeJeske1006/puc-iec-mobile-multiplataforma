// lib/state/favorites.dart
//
// Ex2 (TASK 2): estado compartilhado de favoritos com Riverpod (local).
// Ex4 (TASK 7): mesmo provider, mas sincronizado com Firestore (cloud).
//
// Uma fonte só (`favoritesProvider`) alimenta o coração do card, o contador `♥ N`
// e o botão "limpar" do header — ninguém recebe favoritos por parâmetro.

import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart'; // debugPrint
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// 1 documento por aluno (o projeto Firebase é meu, então o Firestore também).
const favoritesDocPath = 'favorites/meus-favoritos';

class FavoritesNotifier extends Notifier<Set<int>> {
  StreamSubscription<DocumentSnapshot<Map<String, dynamic>>>? _sub;

  /// Só fala com o Firestore se o Firebase subiu (no `flutter test` ele não sobe:
  /// aí o provider se comporta exatamente como a versão local do TASK 2).
  bool get _cloud {
    try {
      return Firebase.apps.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  DocumentReference<Map<String, dynamic>> get _doc =>
      FirebaseFirestore.instance.doc(favoritesDocPath);

  @override
  Set<int> build() {
    if (_cloud) {
      // Ouve o documento em tempo real: o 1º evento popula o estado inicial (sobrevive ao F5)
      // e os seguintes trazem mudanças feitas em OUTRA aba/dispositivo.
      // Com a persistência offline ligada (TASK 10) o 1º evento pode vir do cache local.
      _sub = _doc.snapshots().listen(
            (doc) => state = _idsFrom(doc.data()),
            // `permission-denied` aqui = revise as REGRAS do Firestore.
            onError: (Object e) => debugPrint('Firestore (ler): $e'),
          );
      ref.onDispose(() => _sub?.cancel());
    }
    return {}; // começa vazio até o Firestore responder
  }

  static Set<int> _idsFrom(Map<String, dynamic>? data) =>
      ((data?['ids'] as List<dynamic>?) ?? const [])
          .map((e) => (e as num).toInt()) // na web os números chegam como `num`
          .toSet();

  /// Leitura pontual (sem ficar ouvindo) — útil para forçar um recarregamento.
  Future<void> reload() async {
    if (!_cloud) return;
    try {
      final doc = await _doc.get();
      state = _idsFrom(doc.data());
    } catch (e) {
      debugPrint('Firestore (ler): $e');
    }
  }

  Future<void> _persist(Set<int> next) async {
    if (!_cloud) return; // sem Firebase (ex.: flutter test) o estado local basta
    try {
      await _doc.set({'ids': next.toList()..sort()});
    } catch (e) {
      // offline: com a persistência ligada o SDK guarda a escrita e envia na volta da rede.
      debugPrint('Firestore (gravar): $e'); // `permission-denied` = regras
    }
  }

  void toggle(int id) {
    final next = state.contains(id) ? ({...state}..remove(id)) : {...state, id};
    state = next; // UI reage na hora (atualização otimista)
    _persist(next); // grava no Firestore em paralelo
  }

  void clear() {
    state = {};
    _persist(const {});
  }
}

final favoritesProvider =
    NotifierProvider<FavoritesNotifier, Set<int>>(FavoritesNotifier.new);
