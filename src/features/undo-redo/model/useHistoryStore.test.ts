import { describe, it, expect, beforeEach, vi } from "vitest";
import { useHistoryStore } from "./useHistoryStore";

describe("useHistoryStore", () => {
  beforeEach(() => {
    useHistoryStore.setState({ undoStack: [], redoStack: [] });
  });

  it("execute하면 undoStack에 쌓이고 redoStack은 비워진다", () => {
    const command = {
      id: "1",
      blockId: "A",
      description: "test",
      execute: vi.fn(),
      undo: vi.fn(),
    };

    useHistoryStore.getState().execute(command);

    expect(useHistoryStore.getState().undoStack).toEqual([command]);
    expect(command.execute).toHaveBeenCalled();
  });

  it("undo하면 undoStack에서 빠지고 redoStack에 쌓인다", () => {
    // TODO: execute 먼저 하고, undo 호출해서 확인해보기
    const command = {
      id: "1",
      blockId: "A",
      description: "test",
      execute: vi.fn(),
      undo: vi.fn(),
    };

    useHistoryStore.getState().execute(command);
    useHistoryStore.getState().undo();

    expect(useHistoryStore.getState().undoStack).toEqual([]);
    expect(useHistoryStore.getState().redoStack).toEqual([command]);
    expect(command.undo).toHaveBeenCalled();
  });

  it("invalidateForBlock은 해당 blockId의 Command만 제거한다", () => {
    // TODO: 두 개의 다른 blockId Command를 execute해두고,
    //       invalidateForBlock 호출 후 undoStack 확인해보기
    const command1 = {
      id: "1",
      blockId: "A",
      description: "test A",
      execute: vi.fn(),
      undo: vi.fn(),
    };

    const command2 = {
      id: "2",
      blockId: "B",
      description: "test B",
      execute: vi.fn(),
      undo: vi.fn(),
    };

    useHistoryStore.getState().execute(command1);
    useHistoryStore.getState().execute(command2);
    useHistoryStore.getState().invalidateForBlock("A");

    expect(useHistoryStore.getState().undoStack).toEqual([command2]);
    expect(useHistoryStore.getState().redoStack).toEqual([]);
  });
});
