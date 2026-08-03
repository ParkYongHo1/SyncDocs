import { describe, it, expect, vi } from "vitest";
import { createUpdateBlockCommand } from "./create-commands";

describe("createUpdateBlockCommand", () => {
  it("execute를 호출하면 applyContent가 after 값으로 호출된다", () => {
    const applyContent = vi.fn();
    const command = createUpdateBlockCommand(
      "block-1",
      "이전",
      "이후",
      applyContent,
    );

    command.execute();

    expect(applyContent).toHaveBeenCalledWith("block-1", "이후");
  });

  it("undo를 호출하면 applyContent가 before 값으로 호출된다", () => {
    const applyContent = vi.fn();
    const command = createUpdateBlockCommand(
      "block-1",
      "이전",
      "이후",
      applyContent,
    );

    command.undo();

    expect(applyContent).toHaveBeenCalledWith("block-1", "이전");
  });
});
