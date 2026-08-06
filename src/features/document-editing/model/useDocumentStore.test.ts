import { describe, it, expect, beforeEach } from "vitest";
import { useDocumentStore } from "./useDocumentStore";
import type { Block } from "@/entities/block/model/types";

const makeBlock = (overrides: Partial<Block> = {}): Block => ({
  id: "block-1",
  documentId: "doc-1",
  order: 0,
  content: "원본",
  version: 1,
  updatedBy: "user-1",
  updatedAt: Date.now(),
  deletedAt: null,
  ...overrides,
});

describe("useDocumentStore", () => {
  beforeEach(() => {
    useDocumentStore.setState({ blocks: [] });
  });

  it("setBlocks로 초기화할 수 있다", () => {
    const blocks = makeBlock();
    useDocumentStore.getState().setBlocks([blocks]);
    expect(useDocumentStore.getState().blocks).toEqual([blocks]);
  });

  it("applyContent는 해당 블록의 content만 바꾼다", () => {
    const block = makeBlock();
    useDocumentStore.getState().setBlocks([block]);
    useDocumentStore.getState().applyContent("block-1", "block-1 수정함");
    expect(useDocumentStore.getState().blocks[0].content).toBe(
      "block-1 수정함",
    );
  });

  it("addBlocks는 기존 배열 뒤에 새 블록들을 이어붙인다", () => {
    const block1 = makeBlock({ id: "block-1" });
    const block2 = makeBlock({ id: "block-2" });
    useDocumentStore.getState().setBlocks([block1]);
    useDocumentStore.getState().addBlocks([block2]);

    expect(useDocumentStore.getState().blocks).toEqual([block1, block2]);
  });

  it("markDeleted는 deletedAt을 채운다", () => {
    const block = makeBlock({ deletedAt: null });
    useDocumentStore.getState().setBlocks([block]);

    useDocumentStore.getState().markDeleted("block-1");

    const updated = useDocumentStore.getState().blocks[0];
    expect(updated.deletedAt).not.toBeNull();
  });

  it("restoreBlock은 이미 있는 블록이면 그 자리를 교체한다", () => {
    const block1 = makeBlock({ id: "block-1", content: "원본" });
    const block2 = makeBlock({ id: "block-1", content: "복원" });
    useDocumentStore.getState().setBlocks([block1]);
    useDocumentStore.getState().restoreBlock(block2);

    expect(useDocumentStore.getState().blocks).toEqual([block2]);
  });

  it("restoreBlock은 없는 블록이면 배열 끝에 추가한다", () => {
    const block1 = makeBlock({ id: "block-1" });
    const block2 = makeBlock({ id: "block-2" });
    useDocumentStore.getState().setBlocks([block1]);
    useDocumentStore.getState().restoreBlock(block2);

    expect(useDocumentStore.getState().blocks).toEqual([block1, block2]);
  });

  it("setOrder는 해당 블록의 order만 바꾼다", () => {
    const block1 = makeBlock({ id: "block-1", order: 0 });
    const block2 = makeBlock({ id: "block-2", order: 1 });
    useDocumentStore.getState().setBlocks([block1, block2]);
    useDocumentStore.getState().setOrder("block-1", 5);

    expect(useDocumentStore.getState().blocks[0].order).toBe(5);
    expect(useDocumentStore.getState().blocks[1].order).toBe(1);
  });

  it("setVersion은 해당 블록의 version만 바꾼다", () => {
    const block1 = makeBlock({ id: "block-1", version: 1 });
    const block2 = makeBlock({ id: "block-2", version: 2 });
    useDocumentStore.getState().setBlocks([block1, block2]);
    useDocumentStore.getState().setVersion("block-1", 3);

    expect(useDocumentStore.getState().blocks[0].version).toBe(3);
    expect(useDocumentStore.getState().blocks[1].version).toBe(2);
  });
});
