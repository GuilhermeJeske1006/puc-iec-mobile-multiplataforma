// __tests__/favoritesStore.test.ts
//
// ATIVIDADE 2 — testar useFavoritesStore.
//
// FEITO [TASK 9]: testes pra favoritesStore gerados com IA (ações + persistência MMKV).
//
// Prompt sugerido:
//   "Gere testes Jest pra useFavoritesStore (Zustand) cobrindo:
//    - toggle adiciona id se não existe
//    - toggle remove id se existe
//    - isFavorite retorna true após add
//    - clear esvazia ids
//    Use describe + beforeEach pra resetar state."
//
// Mínimo 3 testes verdes pra CI passar (somados aos 3 de counterStore = 6 total).
//
// Obs.: no Jest o react-native-mmkv usa um mock em memória automaticamente
// (detecta JEST_WORKER_ID), então dá pra testar a persistência sem device.

import { mmkvStorage } from '../src/storage/mmkv';
import {
  FAVORITES_STORAGE_KEY,
  loadInitial,
  useFavoritesStore,
} from '../src/store/favoritesStore';

describe('favoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ ids: [] });
    mmkvStorage.removeItem(FAVORITES_STORAGE_KEY);
  });

  test('toggle adiciona id se não existe', () => {
    useFavoritesStore.getState().toggle(1);
    expect(useFavoritesStore.getState().ids).toEqual([1]);
  });

  test('toggle remove id se existe', () => {
    const { toggle } = useFavoritesStore.getState();
    toggle(1);
    toggle(1);
    expect(useFavoritesStore.getState().ids).toEqual([]);
  });

  test('add não duplica id já favoritado', () => {
    const { add } = useFavoritesStore.getState();
    add(5);
    add(5);
    expect(useFavoritesStore.getState().ids).toEqual([5]);
  });

  test('remove só remove o id alvo', () => {
    const { add, remove } = useFavoritesStore.getState();
    add(1);
    add(2);
    add(3);
    remove(2);
    expect(useFavoritesStore.getState().ids).toEqual([1, 3]);
  });

  test('isFavorite retorna true após add e false após remove', () => {
    const { add, remove, isFavorite } = useFavoritesStore.getState();
    expect(isFavorite(10)).toBe(false);

    add(10);
    expect(useFavoritesStore.getState().isFavorite(10)).toBe(true);

    remove(10);
    expect(useFavoritesStore.getState().isFavorite(10)).toBe(false);
  });

  test('clear esvazia ids', () => {
    const { add, clear } = useFavoritesStore.getState();
    add(1);
    add(2);
    clear();
    expect(useFavoritesStore.getState().ids).toEqual([]);
  });

  test('persiste ids no MMKV a cada mudança', () => {
    const { add } = useFavoritesStore.getState();
    add(42);
    add(7);
    expect(mmkvStorage.getItem(FAVORITES_STORAGE_KEY)).toBe('[42,7]');
  });

  test('loadInitial lê de volta o que está salvo', () => {
    mmkvStorage.setItem(FAVORITES_STORAGE_KEY, '[1,2,3]');
    expect(loadInitial()).toEqual([1, 2, 3]);
  });

  test('loadInitial retorna [] pra JSON corrompido', () => {
    mmkvStorage.setItem(FAVORITES_STORAGE_KEY, '{oops');
    expect(loadInitial()).toEqual([]);
  });

  test('loadInitial retorna [] pra JSON que não é array', () => {
    mmkvStorage.setItem(FAVORITES_STORAGE_KEY, '{"a":1}');
    expect(loadInitial()).toEqual([]);
  });
});
