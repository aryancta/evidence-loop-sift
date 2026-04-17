"use client";

import { create } from "zustand";

interface AppState {
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedCaseId: null,
  setSelectedCaseId: (id) => set({ selectedCaseId: id }),
}));
