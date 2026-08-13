import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useDocumentManager } from "./useDocumentManager";
import { useDocumentStore } from "./useDocumentStore";

vi.mock("@/entities/document/api", () => ({
  fetchDocuments: vi.fn(),
  createDocument: vi.fn(),
  deleteDocument: vi.fn(),
  updateDocumentTitle: vi.fn(),
}));

vi.mock("@/entities/block/api", () => ({
  createBlock: vi.fn(),
  fetchBlocks: vi.fn(),
}));

import {
  fetchDocuments,
  createDocument,
  deleteDocument,
} from "@/entities/document/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockUser = { id: "user-1" };

const mockEditor = {
  document: [{ id: "block-1", type: "heading", content: "" }],
  replaceBlocks: vi.fn(),
} as never;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
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
    currentDocumentId: null,
    isApplyingProgrammaticChange: false,
    isComposing: false,
    isOnline: true,
    pendingActions: [],
  });
});

describe("useDocumentManager - switchDocument", () => {
  it("switchDocument를 호출하면 스토어의 currentDocumentId가 바뀐다", async () => {
    vi.mocked(fetchDocuments).mockResolvedValue([]);

    const { result } = renderHook(
      () => useDocumentManager(mockEditor, mockUser),
      {
        wrapper: createWrapper(),
      },
    );

    act(() => {
      result.current.switchDocument("doc-a");
    });

    expect(useDocumentStore.getState().currentDocumentId).toBe("doc-a");
  });
});

describe("useDocumentManager - createNewDocument", () => {
  it("생성 성공 시 새 문서로 전환한다", async () => {
    vi.mocked(fetchDocuments).mockResolvedValue([]);
    vi.mocked(createDocument).mockResolvedValue({
      id: "new-doc",
      title: "Untitled",
      ownerId: "user-1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isReadonly: false,
    });

    const { result } = renderHook(
      () => useDocumentManager(mockEditor, mockUser),
      {
        wrapper: createWrapper(),
      },
    );

    act(() => {
      result.current.createNewDocument();
    });

    await waitFor(() => {
      expect(useDocumentStore.getState().currentDocumentId).toBe("new-doc");
    });
  });
});

describe("useDocumentManager - deleteDocument", () => {
  it("보고 있던 문서를 삭제하면 남은 문서 중 하나로 전환한다", async () => {
    const docs = [
      {
        id: "doc-a",
        title: "A",
        ownerId: "user-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isReadonly: false,
      },
      {
        id: "doc-b",
        title: "B",
        ownerId: "user-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isReadonly: false,
      },
    ];
    vi.mocked(fetchDocuments).mockResolvedValue(docs);
    vi.mocked(deleteDocument).mockResolvedValue(undefined);

    useDocumentStore.getState().setCurrentDocumentId("doc-a");

    const { result } = renderHook(
      () => useDocumentManager(mockEditor, mockUser),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.documentList).toHaveLength(2);
    });

    act(() => {
      result.current.deleteDocument("doc-a");
    });

    await waitFor(() => {
      expect(useDocumentStore.getState().currentDocumentId).toBe("doc-b");
    });
  });

  it("남은 문서가 없으면 currentDocumentId를 null로 만든다", async () => {
    const docs = [
      {
        id: "doc-a",
        title: "A",
        ownerId: "user-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isReadonly: false,
      },
    ];
    vi.mocked(fetchDocuments).mockResolvedValue(docs);
    vi.mocked(deleteDocument).mockResolvedValue(undefined);

    useDocumentStore.getState().setCurrentDocumentId("doc-a");

    const { result } = renderHook(
      () => useDocumentManager(mockEditor, mockUser),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.documentList).toHaveLength(1);
    });

    act(() => {
      result.current.deleteDocument("doc-a");
    });

    await waitFor(() => {
      expect(useDocumentStore.getState().currentDocumentId).toBeNull();
    });
  });

  it("보고 있지 않은 다른 문서를 삭제하면 currentDocumentId는 그대로 유지된다", async () => {
    const docs = [
      {
        id: "doc-a",
        title: "A",
        ownerId: "user-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isReadonly: false,
      },
      {
        id: "doc-b",
        title: "B",
        ownerId: "user-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isReadonly: false,
      },
    ];
    vi.mocked(fetchDocuments).mockResolvedValue(docs);
    vi.mocked(deleteDocument).mockResolvedValue(undefined);

    useDocumentStore.getState().setCurrentDocumentId("doc-a");

    const { result } = renderHook(
      () => useDocumentManager(mockEditor, mockUser),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.documentList).toHaveLength(2);
    });

    act(() => {
      result.current.deleteDocument("doc-b");
    });

    await waitFor(() => {
      expect(vi.mocked(deleteDocument)).toHaveBeenCalledWith("doc-b");
    });
    expect(useDocumentStore.getState().currentDocumentId).toBe("doc-a");
  });
});
