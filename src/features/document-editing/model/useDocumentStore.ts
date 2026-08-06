import { create } from "zustand";
import type { Block } from "@/entities/block/model/types";

type DocumentState = {
  blocks: Block[];
  currentDocumentId: string | null;

  setBlocks: (blocks: Block[]) => void;

  applyContent: (blockId: string, content: unknown) => void;
  markDeleted: (blockId: string) => void;
  addBlocks: (blocks: Block[]) => void;
  restoreBlock: (block: Block) => void;
  setOrder: (blockId: string, order: number) => void;
  setVersion: (blockId: string, version: number) => void;
};

export const useDocumentStore = create<DocumentState>((set) => ({
  blocks: [],
  currentDocumentId: null,

  setBlocks: (blocks) => set({ blocks }),

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
    set((state) => ({
      blocks: [...state.blocks, ...blocks],
    }));
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
