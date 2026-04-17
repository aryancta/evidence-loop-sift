"use client";

import { create } from "zustand";

interface ThemeState {
  compact: boolean;
  setCompact: (c: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  compact: false,
  setCompact: (c) => set({ compact: c }),
}));
