// src/screens/SettingsScreen.tsx
//
// BÔNUS — 3ª aba (guia: Home + Favoritos + Settings).
// Mostra em runtime as decisões de arquitetura: qual storage está persistindo
// os favoritos, se o JS está rodando no Hermes, e permite limpar os favoritos.

import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { isStoragePersistent } from '@/storage/mmkv';
import { useFavoritesStore } from '@/store/favoritesStore';

// Hermes expõe `HermesInternal` no escopo global; JSC/V8 (web) não.
const isHermes = (globalThis as { HermesInternal?: unknown }).HermesInternal != null;

const storageLabel =
  Platform.OS === 'web'
    ? 'MMKV (web → localStorage)'
    : isStoragePersistent
      ? 'MMKV nativo (JSI)'
      : 'Memória — Expo Go sem MMKV nativo (não persiste)';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const favCount = useFavoritesStore((s) => s.ids.length);
  const clear = useFavoritesStore((s) => s.clear);
  const reduceMotion = useReducedMotion();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.section}>Persistência</Text>
      <Row label="Storage dos favoritos" value={storageLabel} />
      <Row label="Favoritos salvos" value={String(favCount)} />
      <Pressable
        onPress={clear}
        disabled={favCount === 0}
        style={[styles.clearBtn, favCount === 0 && styles.disabled]}
        accessibilityRole="button"
      >
        <Text style={styles.clearText}>Limpar favoritos</Text>
      </Pressable>

      <Text style={styles.section}>Runtime</Text>
      <Row label="Plataforma" value={Platform.OS} />
      <Row label="Engine JS" value={isHermes ? 'Hermes ✅' : 'Não-Hermes (web: V8/JSC)'} />
      <Row label="Reduce Motion do sistema" value={reduceMotion ? 'ligado (sem animações)' : 'desligado'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  section: { fontSize: 13, fontWeight: '700', color: '#666', marginTop: 12, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  label: { fontSize: 15 },
  value: { fontSize: 15, color: '#333', flexShrink: 1, textAlign: 'right' },
  clearBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fde2e2',
  },
  clearText: { color: '#b00020', fontWeight: '600' },
  disabled: { opacity: 0.4 },
});
