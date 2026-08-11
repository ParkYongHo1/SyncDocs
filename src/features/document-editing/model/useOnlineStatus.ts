import { useEffect } from "react";
import {
  createBlock,
  updateBlockContent,
  softDeleteBlock,
  restoreDeletedBlock,
  fetchBlock,
} from "@/entities/block/api";
import { useDocumentStore } from "./useDocumentStore";
import { useConflictStore } from "@/features/conflict-resolution/model/useConflictStore";

export function useOnlineStatus() {
  useEffect(() => {
    const handleOnline = async () => {
      useDocumentStore.getState().setIsOnline(true);

      const queued = useDocumentStore.getState().clearPendingActions();

      for (const action of queued) {
        try {
          if (action.type === "insert") {
            const createdBlock = await createBlock({
              id: action.blockId,
              documentId: action.documentId,
              order: action.order,
              content: action.content,
              type: action.blockType,
            });
            useDocumentStore
              .getState()
              .setVersion(createdBlock.id, createdBlock.version);
          } else if (action.type === "update") {
            try {
              const updatedBlock = await updateBlockContent(
                action.blockId,
                action.content,
                action.baseVersion,
              );
              useDocumentStore
                .getState()
                .setVersion(updatedBlock.id, updatedBlock.version);
            } catch (error) {
              const pgError = error as { code?: string };
              if (pgError.code === "PGRST116") {
                const serverBlock = await fetchBlock(action.blockId);
                useConflictStore.getState().addConflict({
                  blockId: action.blockId,
                  localContent: action.content,
                  serverContent: serverBlock.content,
                  serverVersion: serverBlock.version,
                });
              } else {
                console.error("Failed to resend update action:", error);
              }
            }
          } else if (action.type === "delete") {
            await softDeleteBlock(action.blockId);
          } else if (action.type === "restore") {
            await restoreDeletedBlock(action.blockId);
          }
        } catch (error) {
          console.error("Failed to resend queued action:", action, error);
        }
      }
    };

    const handleOffline = () => {
      useDocumentStore.getState().setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
}
