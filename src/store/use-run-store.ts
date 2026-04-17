"use client";

import { create } from "zustand";

interface RunState {
  activeRunId: string | null;
  setActiveRunId: (id: string | null) => void;
}

export const useRunStore = create<RunState>((set) => ({
  activeRunId: null,
  setActiveRunId: (id) => set({ activeRunId: id }),
}));
