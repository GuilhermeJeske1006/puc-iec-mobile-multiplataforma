// src/store/favoritesStore.ts
//
// ATIVIDADE 2 — TASK 5 (Zustand favorites) + TASK 7 (persist manual + MMKV)
//
// Doc: https://github.com/pmndrs/zustand
//
// Por que persist manual (subscribe) em vez do middleware `persist`?
// - O módulo `zustand/middleware` usa import.meta.env (devtools), que quebra no
//   Metro web bundler.
// - MMKV é síncrono: dá pra ler o estado inicial direto no create(). O store já nasce
//   hidratado, sem o estado intermediário "carregando" do persist assíncrono.
// - Fica explícito QUANDO o save acontece (no subscribe).

import { create } from 'zustand';
import { mmkvStorage } from '@/storage/mmkv';

export const FAVORITES_STORAGE_KEY = 'favorites-ids';

type FavoritesState = {
  ids: number[];
  add: (id: number) => void;
  remove: (id: number) => void;
  toggle: (id: number) => void;
  clear: () => void;
  isFavorite: (id: number) => boolean;
};

/** Lê ids salvos. Defensivo: JSON corrompido ou formato inesperado → lista vazia. */
export const loadInitial = (): number[] => {
  try {
    const raw = mmkvStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === 'number') : [];
  } catch {
    return [];
  }
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: loadInitial(),

  // Imutável: sempre cria array novo → Zustand detecta mudança por referência.
  add: (id) => {
    if (get().ids.includes(id)) return; // sem duplicatas
    set((s) => ({ ids: [...s.ids, id] }));
  },

  remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),

  toggle: (id) => (get().ids.includes(id) ? get().remove(id) : get().add(id)),

  clear: () => set({ ids: [] }),

  // Seletor derivado. Em componente: useFavoritesStore((s) => s.isFavorite(id)) →
  // retorna boolean, então o componente só re-renderiza quando ESSE id muda de estado.
  isFavorite: (id) => get().ids.includes(id),
}));

// Persistência: salva no MMKV sempre que `ids` mudar (só quando a referência muda).
useFavoritesStore.subscribe((state, prev) => {
  if (state.ids === prev.ids) return;
  try {
    mmkvStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.ids));
  } catch (e) {
    console.warn('[favoritesStore] falha ao persistir favoritos', e);
  }
});
