import { create } from "zustand";
import type { Command } from "./types";

type HistoryState = {
  undoStack: Command[];
  redoStack: Command[];
  execute: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  invalidateForBlock: (blockId: string) => void;
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],

  execute: (command) => {
    command.execute();
    set((state) => ({
      undoStack: [...state.undoStack, command],
      redoStack: [],
    }));
  },

  undo: () => {
    const { undoStack } = get();
    const last = undoStack[undoStack.length - 1];
    if (!last) return;

    last.undo();
    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, last],
    }));
  },

  redo: () => {
    const { redoStack } = get();
    const last = redoStack[redoStack.length - 1];
    if (!last) return;

    last.execute();
    set((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, last],
    }));
  },

  invalidateForBlock: (blockId) => {
    set((state) => ({
      undoStack: state.undoStack.filter((cmd) => cmd.blockId !== blockId),
      redoStack: state.redoStack.filter((cmd) => cmd.blockId !== blockId),
    }));
  },
}));
