import { create } from 'zustand';

export const useNestStore = create((set) => ({
    activeNestId: null,
    setActiveNest: (id) => set({ activeNestId: id }),
    clearActiveNest: () => set({ activeNestId: null }),
}));
