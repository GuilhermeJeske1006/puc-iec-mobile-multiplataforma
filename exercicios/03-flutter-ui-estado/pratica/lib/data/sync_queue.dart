// lib/data/sync_queue.dart
//
// FILA DE SINCRONIZAÇÃO — escritas feitas offline ficam guardadas e são enviadas na volta da rede.
//
// TASK 15 (🧑‍💻 EM CASA · 🔴 DIFÍCIL): complete as regras de conflito do enqueue() e o flush().
// A persistência e a idempotência já estão prontas — o desafio é o RACIOCÍNIO (conflitos e falha no meio).
// Os testes estão em test/offline_test.dart (NÃO edite).
import 'dart:convert';
import 'key_value_store.dart';

/// Uma operação pendente: "favoritar" (add=true) ou "desfavoritar" (add=false) um filme.
class PendingOp {
  final String id; // único por operação (ex.: timestamp + movieId)
  final int movieId;
  final bool add;
  const PendingOp({required this.id, required this.movieId, required this.add});

  Map<String, dynamic> toJson() => {'id': id, 'movieId': movieId, 'add': add};
  factory PendingOp.fromJson(Map<String, dynamic> j) =>
      PendingOp(id: j['id'] as String, movieId: j['movieId'] as int, add: j['add'] as bool);
}

class SyncQueue {
  static const queueKey = 'sync_queue_v1';
  final KeyValueStore store;
  SyncQueue(this.store);

  // ── PRONTO: ler e gravar a fila no armário ───────────────────────────────────────────
  Future<List<PendingOp>> pending() async {
    final raw = await store.read(queueKey);
    if (raw == null) return [];
    return (json.decode(raw) as List)
        .map((e) => PendingOp.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> _save(List<PendingOp> ops) =>
      store.write(queueKey, json.encode(ops.map((o) => o.toJson()).toList()));

  // ── PRONTO: enfileirar + idempotência. VOCÊ completa as REGRAS DE CONFLITO (TASK 15a) ─────
  Future<void> enqueue(PendingOp op) async {
    final ops = await pending();

    // (pronto) idempotente: o mesmo id nunca entra duas vezes.
    if (ops.any((o) => o.id == op.id)) return;

    // ── TASK 15a · REGRAS DE CONFLITO (🧑‍💻 EM CASA · difícil, parte 1) ──────────────────────
    // Procure na fila uma operação PENDENTE do MESMO filme (`o.movieId == op.movieId`):
    //   • se for a MESMA ação (ambas add, ou ambas remove) → não enfileire `op` (já está lá);
    //   • se for a AÇÃO OPOSTA (add × remove) → as duas se CANCELAM: remova a antiga da fila,
    //     salve, e NÃO enfileire `op` (o servidor nem precisa saber).
    // Em qualquer desses casos: `await _save(...)` quando mudar a fila, e dê `return`.
    final i = ops.indexWhere((o) => o.movieId == op.movieId);
    if (i >= 0) {
      if (ops[i].add == op.add) return; // mesma ação: já está na fila, não duplica
      ops.removeAt(i); // ação oposta: as duas se cancelam (o servidor nem fica sabendo)
      await _save(ops);
      return;
    }

    ops.add(op); // (pronto) sem conflito: vai pro fim da fila
    await _save(ops);
  }

  // ── TASK 15b — flush (🧑‍💻 EM CASA · difícil, parte 2) ─────────────────────────────────
  // Envie as operações na ORDEM da fila chamando `send(op)` (que pode lançar erro/offline).
  //   - a cada sucesso: remova a operação da fila E persista (se o app fechar no meio, não reenvia);
  //   - no PRIMEIRO erro: PARE (as restantes continuam na fila, na mesma ordem) e NÃO propague o erro;
  //   - devolva quantas operações foram enviadas com sucesso.
  // Dica: `final ops = await pending();` → percorra com for → try { await send(op); ... } catch (_) { break; }
  Future<int> flush(Future<void> Function(PendingOp op) send) async {
    final ops = await pending();
    var sent = 0;
    while (ops.isNotEmpty) {
      try {
        await send(ops.first); // na ORDEM da fila
      } catch (_) {
        break; // 1º erro: para aqui; o resto fica na fila, na mesma ordem (e o erro não sobe)
      }
      ops.removeAt(0);
      sent++;
      await _save(ops); // persiste a cada sucesso: se o app fechar no meio, não reenvia
    }
    return sent;
  }
}
