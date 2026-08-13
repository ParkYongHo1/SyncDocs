import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEditorSync } from "./useEditorSync";
import { useDocumentStore } from "./useDocumentStore";
import { useHistoryStore } from "@/features/undo-redo/model/useHistoryStore";

vi.mock("@/entities/block/api", () => ({
  createBlock: vi.fn().mockResolvedValue({
    id: "block-1",
    documentId: "doc-1",
    order: 0,
    content: [],
    type: "paragraph",
    version: 1,
    updatedBy: "",
    updatedAt: Date.now(),
    deletedAt: null,
  }),
  softDeleteBlock: vi.fn().mockResolvedValue({}),
  restoreDeletedBlock: vi.fn().mockResolvedValue({}),
}));

vi.mock("./useUpdateBlockMutation", () => ({
  useUpdateBlockMutation: () => ({ mutate: vi.fn() }),
}));

import { createBlock } from "@/entities/block/api";

function makeMockEditor() {
  let registeredCallback:
    | ((editor: unknown, ctx: { getChanges: () => unknown[] }) => void)
    | null = null;

  return {
    document: [{ id: "block-1", type: "heading", content: [] }],
    updateBlock: vi.fn(),
    insertBlocks: vi.fn(),
    getTextCursorPosition: vi.fn(),
    onChange: vi.fn((cb) => {
      registeredCallback = cb;
      return () => {};
    }),
    triggerChange(changes: unknown[]) {
      registeredCallback?.(null, { getChanges: () => changes });
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  useDocumentStore.setState({
    blocks: [],
    currentDocumentId: "doc-1",
    isApplyingProgrammaticChange: false,
    isComposing: false,
    isOnline: true,
    pendingActions: [],
  });
  useHistoryStore.setState({ undoStack: [], redoStack: [] });
});

describe("useEditorSync - 프로그램적 변경 무시", () => {
  it("isApplyingProgrammaticChange가 true면 change를 무시한다", () => {
    useDocumentStore.getState().setIsApplyingProgrammaticChange(true);
    const editor = makeMockEditor();

    renderHook(() => useEditorSync(editor as never));

    editor.triggerChange([
      {
        type: "insert",
        block: { id: "new-block", content: [], type: "paragraph" },
        source: { type: "local" },
      },
    ]);

    expect(useDocumentStore.getState().blocks).toHaveLength(0);
  });

  it("undo/redo에서 온 change는 무시한다", () => {
    const editor = makeMockEditor();
    renderHook(() => useEditorSync(editor as never));

    editor.triggerChange([
      {
        type: "insert",
        block: { id: "new-block", content: [], type: "paragraph" },
        source: { type: "undo" },
      },
    ]);

    expect(useDocumentStore.getState().blocks).toHaveLength(0);
  });
});

describe("useEditorSync - insert", () => {
  it("insert 시 임시 블록을 스토어에 즉시 추가한다", () => {
    const editor = makeMockEditor();
    renderHook(() => useEditorSync(editor as never));

    editor.triggerChange([
      {
        type: "insert",
        block: {
          id: "new-block",
          content: [{ text: "hi" }],
          type: "paragraph",
        },
        source: { type: "local" },
      },
    ]);

    const block = useDocumentStore
      .getState()
      .blocks.find((b) => b.id === "new-block");
    expect(block).toBeDefined();
    expect(block?.version).toBe(0);
  });

  it("insert 시 content가 undefined면 빈 배열로 대체한다", () => {
    const editor = makeMockEditor();
    renderHook(() => useEditorSync(editor as never));

    editor.triggerChange([
      {
        type: "insert",
        block: { id: "new-block", content: undefined, type: "paragraph" },
        source: { type: "local" },
      },
    ]);

    const block = useDocumentStore
      .getState()
      .blocks.find((b) => b.id === "new-block");
    expect(block?.content).toEqual([]);
  });

  it("오프라인이면 createBlock을 호출하지 않고 큐에 쌓는다", () => {
    useDocumentStore.getState().setIsOnline(false);
    const editor = makeMockEditor();
    renderHook(() => useEditorSync(editor as never));

    editor.triggerChange([
      {
        type: "insert",
        block: { id: "new-block", content: [], type: "paragraph" },
        source: { type: "local" },
      },
    ]);

    expect(createBlock).not.toHaveBeenCalled();
    const pending = useDocumentStore.getState().pendingActions;
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe("insert");
  });

  it("온라인이면 createBlock을 호출한다", () => {
    const editor = makeMockEditor();
    renderHook(() => useEditorSync(editor as never));

    editor.triggerChange([
      {
        type: "insert",
        block: { id: "new-block", content: [], type: "paragraph" },
        source: { type: "local" },
      },
    ]);

    expect(createBlock).toHaveBeenCalledTimes(1);
  });
});

describe("useEditorSync - update", () => {
  it("스토어에 없는 블록의 update는 서버 전송 없이 무시한다", () => {
    const editor = makeMockEditor();
    renderHook(() => useEditorSync(editor as never));

    editor.triggerChange([
      {
        type: "update",
        block: { id: "unknown-block", content: [{ text: "x" }] },
        prevBlock: { content: [] },
        source: { type: "local" },
      },
    ]);

    // 에러 없이 무시되는지만 확인 (별도 스토어 변화 없음)
    expect(useDocumentStore.getState().blocks).toHaveLength(0);
  });

  it("스토어에 있는 블록을 update하면 undoStack에 Command가 쌓인다", () => {
    useDocumentStore.getState().setBlocks([
      {
        id: "block-1",
        documentId: "doc-1",
        order: 0,
        content: [],
        type: "paragraph",
        version: 1,
        updatedBy: "",
        updatedAt: Date.now(),
        deletedAt: null,
      },
    ]);
    const editor = makeMockEditor();
    renderHook(() => useEditorSync(editor as never));

    editor.triggerChange([
      {
        type: "update",
        block: { id: "block-1", content: [{ text: "new" }] },
        prevBlock: { content: [] },
        source: { type: "local" },
      },
    ]);

    expect(useHistoryStore.getState().undoStack).toHaveLength(1);
  });
});
