import { create } from "zustand";
import type { Block } from "@/entities/block/model/types";
import type { PendingAction } from "@/features/document-editing/model/types";

type DocumentState = {
  blocks: Block[];
  currentDocumentId: string | null;
  isApplyingProgrammaticChange: boolean;
  isComposing: boolean;
  isOnline: boolean;
  pendingActions: PendingAction[];
  setIsApplyingProgrammaticChange: (value: boolean) => void;
  setIsComposing: (value: boolean) => void;
  setIsOnline: (value: boolean) => void;
  addPendingAction: (action: PendingAction) => void;
  clearPendingActions: () => PendingAction[];
  setBlocks: (blocks: Block[]) => void;
  setCurrentDocumentId: (id: string | null) => void;
  applyContent: (blockId: string, content: unknown) => void;
  markDeleted: (blockId: string) => void;
  addBlocks: (blocks: Block[]) => void;
  restoreBlock: (block: Block) => void;
  setOrder: (blockId: string, order: number) => void;
  setVersion: (blockId: string, version: number) => void;
};

export const useDocumentStore = create<DocumentState>((set, get) => ({
  blocks: [],
  currentDocumentId: null,
  isApplyingProgrammaticChange: false,
  isComposing: false,
  isOnline: true,
  pendingActions: [],

  setBlocks: (blocks) => set({ blocks }),
  setCurrentDocumentId: (id) => set({ currentDocumentId: id }),
  setIsApplyingProgrammaticChange: (value) =>
    set({ isApplyingProgrammaticChange: value }),
  setIsComposing: (value) => set({ isComposing: value }),
  setIsOnline: (value) => set({ isOnline: value }),

  addPendingAction: (action) =>
    set((state) => ({ pendingActions: [...state.pendingActions, action] })),

  clearPendingActions: () => {
    const current = get().pendingActions;
    set({ pendingActions: [] });
    return current;
  },

  applyContent: (blockId, content) => {
    set((state) => ({
      blocks: state.blocks.map((block) => {
        if (block.id === blockId) {
          return { ...block, content };
        }
        return block;
      }),
    }));
  },

  markDeleted: (blockId) => {
    set((state) => ({
      blocks: state.blocks.map((block) => {
        if (block.id === blockId) {
          return { ...block, deletedAt: Date.now() };
        }
        return block;
      }),
    }));
  },

  addBlocks: (blocks) => {
    set((state) => {
      const blockMap = new Map(state.blocks.map((b) => [b.id, b]));
      blocks.forEach((b) => blockMap.set(b.id, b));
      return { blocks: Array.from(blockMap.values()) };
    });
  },

  restoreBlock: (block) => {
    set((state) => {
      const existingIndex = state.blocks.findIndex((b) => b.id === block.id);
      if (existingIndex !== -1) {
        const newBlocks = [...state.blocks];
        newBlocks[existingIndex] = block;
        return { blocks: newBlocks };
      } else {
        return { blocks: [...state.blocks, block] };
      }
    });
  },

  setOrder: (blockId, order) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === blockId ? { ...block, order } : block,
      ),
    }));
  },

  setVersion: (blockId, version) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === blockId ? { ...block, version } : block,
      ),
    }));
  },
}));
