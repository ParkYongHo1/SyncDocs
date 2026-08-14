import { create } from "zustand";

export type ConflictInfo = {
  blockId: string;
  localContent: unknown;
  serverContent: unknown;
  serverVersion: number;
};

type ConflictState = {
  conflicts: ConflictInfo[];
  addConflict: (conflict: ConflictInfo) => void;
  resolveConflict: (blockId: string) => void;
};

export const useConflictStore = create<ConflictState>((set) => ({
  conflicts: [],

  addConflict: (conflict) => {
    set((state) => ({
      conflicts: state.conflicts.some((c) => c.blockId === conflict.blockId)
        ? state.conflicts
        : [...state.conflicts, conflict],
    }));
  },

  resolveConflict: (blockId) => {
    set((state) => ({
      conflicts: state.conflicts.filter((c) => c.blockId !== blockId),
    }));
  },
}));
