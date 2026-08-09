import { useCallback, useEffect, useRef } from "react";
import type { BlockNoteEditor } from "@blocknote/core";
import { useHistoryStore } from "@/features/undo-redo/model/useHistoryStore";
import { createUpdateBlockCommand } from "@/features/undo-redo/lib/create-commands";

export function useEditorSync(editor: BlockNoteEditor) {
  const isApplyingHistoryRef = useRef(false);

  const applyContent = useCallback(
    (blockId: string, content: unknown) => {
      isApplyingHistoryRef.current = true;
      editor.updateBlock(blockId, { content } as never);
      setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 0);
    },
    [editor],
  );

  useEffect(() => {
    const cleanup = editor.onChange((_editor, { getChanges }) => {
      if (isApplyingHistoryRef.current) {
        return;
      }

      const changes = getChanges();
      console.log("Changes detected:", changes);
      changes.forEach((change) => {
        if (change.source.type === "undo" || change.source.type === "redo") {
          return;
        }

        if (change.type === "update") {
          const command = createUpdateBlockCommand(
            change.block.id,
            change.prevBlock.content,
            change.block.content,
            applyContent,
          );
          useHistoryStore.getState().execute(command);
        }
        if (change.type === "delete") {
          // TODO: 채워보기
          // 힌트: 지금은 서버 연동 전이라, markDeleted/restoreBlock을
          //       useDocumentStore에서 그대로 가져다 쓸 순 없어(그 스토어는
          //       Block 타입 전체를 요구하니까). 지금 단계에서는
          //       "Undo/Redo가 로컬에서 동작하는 것"만 확인하는 게 목표니,
          //       일단 console.log(change)로 change.block이 어떤 모양인지
          //       확인해보는 것부터 시작해도 돼.
        }

        if (change.type === "insert") {
          // TODO: 채워보기 (지금은 서버에 저장 안 하니, 일단 로그만 찍어서
          //       insert가 어떻게 감지되는지 확인)
        }
      });
    });

    return cleanup;
  }, [editor, applyContent]);
}
