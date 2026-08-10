import { useCallback, useEffect, useRef } from "react";
import type { BlockNoteEditor } from "@blocknote/core";
import { useHistoryStore } from "@/features/undo-redo/model/useHistoryStore";
import {
  createDeleteCommand,
  createUpdateBlockCommand,
} from "@/features/undo-redo/lib/create-commands";
import { useDocumentStore } from "./useDocumentStore";
import {
  createBlock,
  restoreDeletedBlock,
  softDeleteBlock,
} from "@/entities/block/api";
import { useUpdateBlockMutation } from "./useUpdateBlockMutation";
import { Block } from "@/entities/block/model/types";

export function useEditorSync(editor: BlockNoteEditor) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { mutate: updateBlockMutate } = useUpdateBlockMutation();

  const debouncedSendToServer = useCallback(
    (blockId: string, content: unknown, baseVersion: number) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        updateBlockMutate({ blockId, content, baseVersion });
      }, 400);
    },
    [updateBlockMutate],
  );
  const applyContent = useCallback(
    (blockId: string, content: unknown) => {
      useDocumentStore.getState().setIsApplyingProgrammaticChange(true);
      editor.updateBlock(blockId, { content } as never);
      useDocumentStore.getState().applyContent(blockId, content);

      const block = useDocumentStore
        .getState()
        .blocks.find((b) => b.id === blockId);
      if (block) {
        debouncedSendToServer(blockId, content, block.version);
      }

      setTimeout(() => {
        useDocumentStore.getState().setIsApplyingProgrammaticChange(false);
      }, 0);
    },
    [editor, debouncedSendToServer],
  );
  const markDeleted = useCallback((blockId: string) => {
    useDocumentStore.getState().markDeleted(blockId);
    softDeleteBlock(blockId).catch((error) => {
      console.error("Failed to soft delete block:", error);
    });
  }, []);

  const restoreDeletedBlockFn = useCallback(
    (block: Block) => {
      useDocumentStore.getState().setIsApplyingProgrammaticChange(true);

      const lastBlock = editor.document[editor.document.length - 1];
      if (lastBlock) {
        editor.insertBlocks([block as never], lastBlock.id, "after");
      } else {
        editor.insertBlocks([block as never], editor.document[0]?.id, "before");
      }

      setTimeout(() => {
        useDocumentStore.getState().setIsApplyingProgrammaticChange(false);
      }, 0);

      useDocumentStore.getState().restoreBlock(block);
      restoreDeletedBlock(block.id).catch((error) => {
        console.error("Failed to restore deleted block:", error);
      });
    },
    [editor],
  );
  useEffect(() => {
    const cleanup = editor.onChange((_editor, { getChanges }) => {
      const isApplying =
        useDocumentStore.getState().isApplyingProgrammaticChange;

      if (isApplying) {
        return;
      }

      const changes = getChanges();

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

          const block = useDocumentStore
            .getState()
            .blocks.find((b) => b.id === change.block.id);
          if (!block) {
            console.warn(
              "블록을 찾을 수 없음, 서버 전송 무시:",
              change.block.id,
            );
            return;
          }
          debouncedSendToServer(
            change.block.id,
            change.block.content,
            block.version,
          );
        }
        if (change.type === "insert") {
          const documentId = useDocumentStore.getState().currentDocumentId;
          if (!documentId) return;

          const order = editor.document.findIndex(
            (b) => b.id === change.block.id,
          );

          useDocumentStore.getState().addBlocks([
            {
              id: change.block.id,
              documentId,
              order,
              content: change.block.content,
              version: 0,
              updatedBy: "",
              updatedAt: Date.now(),
              deletedAt: null,
            },
          ]);
          createBlock({
            id: change.block.id,
            documentId,
            order,
            content: change.block.content,
          })
            .then((createdBlock) => {
              useDocumentStore.getState().addBlocks([createdBlock]);
            })
            .catch((error) => {
              console.error("블록 생성 실패:", error);
            });
        }
        if (change.type === "delete") {
          const block = useDocumentStore
            .getState()
            .blocks.find((b) => b.id === change.block.id);
          if (!block) return;

          const command = createDeleteCommand(
            block,
            markDeleted,
            restoreDeletedBlockFn,
          );
          useHistoryStore.getState().execute(command);
        }
      });
    });

    return cleanup;
  }, [
    editor,
    applyContent,
    debouncedSendToServer,
    markDeleted,
    restoreDeletedBlockFn,
  ]);
}
