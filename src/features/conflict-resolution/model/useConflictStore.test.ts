import { describe, it, expect, beforeEach } from "vitest";
import { useConflictStore, type ConflictInfo } from "./useConflictStore";

function makeConflict(overrides: Partial<ConflictInfo> = {}): ConflictInfo {
  return {
    blockId: "block-1",
    documentId: "document-1",
    localContent: [{ text: "local" }],
    serverContent: [{ text: "server" }],
    serverVersion: 3,
    ...overrides,
  };
}

beforeEach(() => {
  useConflictStore.setState({ conflicts: [] });
});

describe("useConflictStore - addConflict", () => {
  it("새 충돌을 배열 끝에 추가한다", () => {
    useConflictStore.getState().addConflict(makeConflict({ blockId: "a" }));
    useConflictStore.getState().addConflict(makeConflict({ blockId: "b" }));

    const conflicts = useConflictStore.getState().conflicts;
    expect(conflicts).toHaveLength(2);
    expect(conflicts[0].blockId).toBe("a");
    expect(conflicts[1].blockId).toBe("b");
  });

  it("같은 blockId의 충돌이 이미 있으면 중복 추가하지 않는다", () => {
    useConflictStore
      .getState()
      .addConflict(makeConflict({ blockId: "a", serverVersion: 1 }));
    useConflictStore
      .getState()
      .addConflict(makeConflict({ blockId: "a", serverVersion: 2 }));

    const conflicts = useConflictStore.getState().conflicts;
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].serverVersion).toBe(1);
  });
});

describe("useConflictStore - resolveConflict", () => {
  it("해당 blockId의 충돌만 제거하고 나머지는 유지한다", () => {
    useConflictStore.getState().addConflict(makeConflict({ blockId: "a" }));
    useConflictStore.getState().addConflict(makeConflict({ blockId: "b" }));

    useConflictStore.getState().resolveConflict("a");

    const conflicts = useConflictStore.getState().conflicts;
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].blockId).toBe("b");
  });

  it("존재하지 않는 blockId를 resolve해도 에러 없이 그대로 유지된다", () => {
    useConflictStore.getState().addConflict(makeConflict({ blockId: "a" }));

    useConflictStore.getState().resolveConflict("not-exist");

    expect(useConflictStore.getState().conflicts).toHaveLength(1);
  });
});
