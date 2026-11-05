// lib/firebase_options.dart — TASK 3: config do MEU projeto Firebase (cinefav-guilherme-jeske).
//
// Mesmo formato que o `flutterfire configure` gera (Plano B do enunciado: valores copiados do
// console → Configurações do projeto → app Web). Projeto pessoal, plano Spark (free tier):
// a apiKey da web NÃO é segredo — quem protege os dados são as REGRAS do Firestore, que só
// liberam o documento `favorites/meus-favoritos`.
// ignore_for_file: type=lint
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      case TargetPlatform.fuchsia:
        throw UnsupportedError(
          'DefaultFirebaseOptions só foi configurado para WEB nesta atividade '
          '(rode `flutterfire configure` de novo para adicionar outra plataforma).',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBUP4WCnpC98X9mJ1HJ0L_2VJ-o-Mh0A-0',
    appId: '1:171887263782:web:c383da05dce6a1896ea6e7',
    messagingSenderId: '171887263782',
    projectId: 'cinefav-guilherme-jeske',
    authDomain: 'cinefav-guilherme-jeske.firebaseapp.com',
    storageBucket: 'cinefav-guilherme-jeske.firebasestorage.app',
  );
}
