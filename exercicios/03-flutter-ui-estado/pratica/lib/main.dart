// lib/main.dart — ponto de entrada do app.
//
// ProviderScope = a "raiz" do Riverpod (deixa qualquer widget ler providers).

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'data/key_value_store.dart';
import 'firebase_options.dart'; // gerado pelo `flutterfire configure` (TASK 3)
import 'state/movies_provider.dart';

import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized(); // necessário p/ SharedPreferences (e p/ o Firebase)
  final prefs = await SharedPreferences.getInstance(); // o "armário" que sobrevive ao F5

  // TASK 3 + TASK 7: sobe o Firebase do MEU projeto antes do runApp (favoritos vivem no Firestore).
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  // TASK 10: persistência OFFLINE do Firestore (na web ela vem DESLIGADA por padrão).
  // Escritas feitas sem rede ficam numa fila local do Firestore e sincronizam sozinhas na volta;
  // leituras sem rede são servidas do cache (IndexedDB).
  FirebaseFirestore.instance.settings = const Settings(persistenceEnabled: true);

  runApp(ProviderScope(
    overrides: [storeProvider.overrideWithValue(SharedPrefsStore(prefs))],
    child: const MovieApp(),
  ));
}

class MovieApp extends StatelessWidget {
  const MovieApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Filmes',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark(), // tema pronto (dark premium) — você não precisa mexer
      home: const HomeScreen(),
    );
  }
}
