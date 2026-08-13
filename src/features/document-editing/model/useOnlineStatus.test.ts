import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOnlineStatus } from "./useOnlineStatus";
import { useDocumentStore } from "./useDocumentStore";
import { useConflictStore } from "@/features/conflict-resolution/model/useConflictStore";

vi.mock("@/entities/block/api", () => ({
  createBlock: vi.fn(),
  updateBlockContent: vi.fn(),
  softDeleteBlock: vi.fn(),
  restoreDeletedBlock: vi.fn(),
  fetchBlock: vi.fn(),
}));

import {
  createBlock,
  updateBlockContent,
  softDeleteBlock,
  restoreDeletedBlock,
  fetchBlock,
} from "@/entities/block/api";

function fireWindowEvent(type: "online" | "offline") {
  window.dispatchEvent(new Event(type));
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
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
  useConflictStore.setState({ conflicts: [] });
});

describe("useOnlineStatus - 상태 감지", () => {
  it("offline 이벤트가 오면 isOnline을 false로 바꾼다", () => {
    renderHook(() => useOnlineStatus());

    fireWindowEvent("offline");

    expect(useDocumentStore.getState().isOnline).toBe(false);
  });

  it("online 이벤트가 오면 isOnline을 true로 바꾼다", async () => {
    useDocumentStore.getState().setIsOnline(false);
    renderHook(() => useOnlineStatus());

    fireWindowEvent("online");
    await flushMicrotasks();

    expect(useDocumentStore.getState().isOnline).toBe(true);
  });
});

describe("useOnlineStatus - 큐 재전송", () => {
  it("online이 되면 큐에 쌓인 액션들을 순서대로 재전송하고 큐를 비운다", async () => {
    vi.mocked(createBlock).mockResolvedValue({
      id: "block-1",
      documentId: "doc-1",
      order: 0,
      content: [],
      type: "paragraph",
      version: 1,
      updatedBy: "",
      updatedAt: Date.now(),
      deletedAt: null,
    });
    vi.mocked(softDeleteBlock).mockResolvedValue({} as never);

    useDocumentStore.getState().addPendingAction({
      type: "insert",
      blockId: "block-1",
      documentId: "doc-1",
      order: 0,
      content: [],
      blockType: "paragraph",
    });
    useDocumentStore.getState().addPendingAction({
      type: "delete",
      blockId: "block-2",
    });

    renderHook(() => useOnlineStatus());
    fireWindowEvent("online");
    await flushMicrotasks();

    expect(createBlock).toHaveBeenCalledTimes(1);
    expect(softDeleteBlock).toHaveBeenCalledWith("block-2");
    expect(useDocumentStore.getState().pendingActions).toHaveLength(0);
  });

  it("update 재전송이 버전 충돌(PGRST116)로 실패하면 충돌 배너를 등록한다", async () => {
    vi.mocked(updateBlockContent).mockRejectedValue({ code: "PGRST116" });
    vi.mocked(fetchBlock).mockResolvedValue({
      id: "block-1",
      documentId: "doc-1",
      order: 0,
      content: [{ text: "server" }],
      type: "paragraph",
      version: 5,
      updatedBy: "",
      updatedAt: Date.now(),
      deletedAt: null,
    });

    useDocumentStore.getState().addPendingAction({
      type: "update",
      blockId: "block-1",
      content: [{ text: "local" }],
      baseVersion: 1,
    });

    renderHook(() => useOnlineStatus());
    fireWindowEvent("online");
    await flushMicrotasks();

    const conflicts = useConflictStore.getState().conflicts;
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].serverVersion).toBe(5);
  });

  it("update 재전송이 버전 충돌이 아닌 이유로 실패하면 충돌 배너를 등록하지 않는다", async () => {
    vi.mocked(updateBlockContent).mockRejectedValue({ code: "OTHER" });

    useDocumentStore.getState().addPendingAction({
      type: "update",
      blockId: "block-1",
      content: [{ text: "local" }],
      baseVersion: 1,
    });

    renderHook(() => useOnlineStatus());
    fireWindowEvent("online");
    await flushMicrotasks();

    expect(useConflictStore.getState().conflicts).toHaveLength(0);
  });

  it("restore 액션도 순서대로 재전송된다", async () => {
    vi.mocked(restoreDeletedBlock).mockResolvedValue({} as never);

    useDocumentStore.getState().addPendingAction({
      type: "restore",
      blockId: "block-1",
    });

    renderHook(() => useOnlineStatus());
    fireWindowEvent("online");
    await flushMicrotasks();

    expect(restoreDeletedBlock).toHaveBeenCalledWith("block-1");
  });

  it("큐가 비어있으면 아무 API도 호출하지 않는다", async () => {
    renderHook(() => useOnlineStatus());
    fireWindowEvent("online");
    await flushMicrotasks();

    expect(createBlock).not.toHaveBeenCalled();
    expect(updateBlockContent).not.toHaveBeenCalled();
    expect(softDeleteBlock).not.toHaveBeenCalled();
    expect(restoreDeletedBlock).not.toHaveBeenCalled();
  });
});
