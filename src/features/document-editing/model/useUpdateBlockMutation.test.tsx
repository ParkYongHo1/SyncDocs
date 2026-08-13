import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useUpdateBlockMutation } from "./useUpdateBlockMutation";
import { useDocumentStore } from "./useDocumentStore";
import { useConflictStore } from "@/features/conflict-resolution/model/useConflictStore";

vi.mock("@/entities/block/api", () => ({
  updateBlockContent: vi.fn(),
  fetchBlock: vi.fn(),
}));

import { updateBlockContent, fetchBlock } from "@/entities/block/api";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return Wrapper;
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

describe("useUpdateBlockMutation - 성공", () => {
  it("성공하면 스토어의 버전을 서버 응답 값으로 갱신한다", async () => {
    useDocumentStore.getState().setBlocks([
      {
        id: "block-1",
        documentId: "doc-1",
        order: 0,
        content: [{ text: "old" }],
        type: "paragraph",
        version: 2,
        updatedBy: "",
        updatedAt: Date.now(),
        deletedAt: null,
      },
    ]);

    vi.mocked(updateBlockContent).mockResolvedValue({
      id: "block-1",
      documentId: "doc-1",
      order: 0,
      content: [{ text: "saved" }],
      type: "paragraph",
      version: 3,
      updatedBy: "",
      updatedAt: Date.now(),
      deletedAt: null,
    });

    const { result } = renderHook(() => useUpdateBlockMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        blockId: "block-1",
        content: [{ text: "saved" }],
        baseVersion: 2,
      });
    });

    await waitFor(() => {
      const block = useDocumentStore
        .getState()
        .blocks.find((b) => b.id === "block-1");
      expect(block?.version).toBe(3);
    });
  });
});

describe("useUpdateBlockMutation - 실패", () => {
  it("버전 충돌(PGRST116)이면 서버 최신 상태를 조회해 충돌 배너에 등록한다", async () => {
    vi.mocked(updateBlockContent).mockRejectedValue({ code: "PGRST116" });
    vi.mocked(fetchBlock).mockResolvedValue({
      id: "block-1",
      documentId: "doc-1",
      order: 0,
      content: [{ text: "server-latest" }],
      type: "paragraph",
      version: 7,
      updatedBy: "",
      updatedAt: Date.now(),
      deletedAt: null,
    });

    const { result } = renderHook(() => useUpdateBlockMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        blockId: "block-1",
        content: [{ text: "local" }],
        baseVersion: 2,
      });
    });

    await waitFor(() => {
      expect(useConflictStore.getState().conflicts).toHaveLength(1);
    });

    const conflict = useConflictStore.getState().conflicts[0];
    expect(conflict.blockId).toBe("block-1");
    expect(conflict.serverVersion).toBe(7);
  });

  it("버전 충돌이 아닌 에러는 충돌 배너를 등록하지 않는다", async () => {
    vi.mocked(updateBlockContent).mockRejectedValue({ code: "OTHER" });

    const { result } = renderHook(() => useUpdateBlockMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        blockId: "block-1",
        content: [{ text: "local" }],
        baseVersion: 2,
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(useConflictStore.getState().conflicts).toHaveLength(0);
    expect(fetchBlock).not.toHaveBeenCalled();
  });
});
