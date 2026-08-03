import type { Command } from "../model/types";
import type { Block } from "@/entities/block/model/types";

export function createUpdateBlockCommand(
  blockId: string,
  before: unknown,
  after: unknown,
  applyContent: (blockId: string, content: unknown) => void,
): Command {
  return {
    id: crypto.randomUUID(),
    blockId,
    description: "블록 수정: " + blockId,
    execute: () => applyContent(blockId, after),
    undo: () => applyContent(blockId, before),
  };
}

export function createDeleteCommand(
  block: Block,
  markDeleted: (blockId: string) => void,
  restoreBlock: (block: Block) => void,
): Command {
  return {
    id: crypto.randomUUID(),
    blockId: block.id,
    description: "블록 삭제: " + block.id,
    execute: () => {
      markDeleted(block.id);
    },
    undo: () => {
      restoreBlock(block);
    },
  };
}

export function createReorderCommand(
  blockId: string,
  fromOrder: number,
  toOrder: number,
  setOrder: (blockId: string, order: number) => void,
): Command {
  return {
    id: crypto.randomUUID(),
    blockId: blockId,
    description: "블록 순서 변경: " + blockId,
    execute: () => {
      setOrder(blockId, toOrder);
    },
    undo: () => {
      setOrder(blockId, fromOrder);
    },
  };
}
