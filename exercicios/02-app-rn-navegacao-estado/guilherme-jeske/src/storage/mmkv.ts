// src/storage/mmkv.ts
//
// ATIVIDADE 2 — TASK 7 (storage síncrono)
//
// MMKV (C++ via JSI) é ~30x mais rápido que AsyncStorage e é SÍNCRONO:
// leitura acontece na hora, sem Promise/await e sem passar pela bridge.
//
// - iOS/Android (dev build): MMKV nativo via JSI.
// - Web: o próprio react-native-mmkv usa localStorage por baixo.
// - Jest: react-native-mmkv detecta ambiente de teste e usa um mock em memória.
// - Expo Go: o módulo nativo do MMKV NÃO vem no Expo Go → `new MMKV()` lança erro.
//   Nesse caso caímos num Map em memória pra o app não quebrar (sem persistência
//   entre reloads). Pra persistência real: `npx expo run:ios` / `run:android`.
//
// Doc: https://github.com/mrousavy/react-native-mmkv

import { MMKV } from 'react-native-mmkv';

/** Subconjunto da API do MMKV que o app usa. */
type KeyValueStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

const createMemoryStorage = (): KeyValueStorage => {
  const map = new Map<string, string>();
  return {
    getString: (key) => map.get(key),
    set: (key, value) => {
      map.set(key, value);
    },
    delete: (key) => {
      map.delete(key);
    },
  };
};

const createStorage = (): { storage: KeyValueStorage; isPersistent: boolean } => {
  try {
    return { storage: new MMKV({ id: 'favorites-store' }), isPersistent: true };
  } catch (e) {
    console.warn(
      '[mmkv] módulo nativo indisponível (Expo Go?). Usando storage em memória — ' +
        'favoritos não vão sobreviver a reloads. Rode um dev build pra persistir.',
      e
    );
    return { storage: createMemoryStorage(), isPersistent: false };
  }
};

const created = createStorage();

/** Instância MMKV (ou fallback em memória no Expo Go). */
export const storage: KeyValueStorage = created.storage;

/** `false` quando caiu no fallback em memória (Expo Go). */
export const isStoragePersistent = created.isPersistent;

/**
 * Adapter com a interface `StateStorage` do Zustand (getItem/setItem/removeItem).
 * Tudo síncrono — por isso o store consegue hidratar já no create(), sem flash de estado vazio.
 */
export const mmkvStorage = {
  getItem: (name: string): string | null => storage.getString(name) ?? null,
  setItem: (name: string, value: string): void => storage.set(name, value),
  removeItem: (name: string): void => storage.delete(name),
};
