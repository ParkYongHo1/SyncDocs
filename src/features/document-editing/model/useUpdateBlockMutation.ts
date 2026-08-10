import { useMutation } from "@tanstack/react-query";
import { updateBlockContent, fetchBlock } from "@/entities/block/api";
import { useDocumentStore } from "./useDocumentStore";
import { useConflictStore } from "@/features/conflict-resolution/model/useConflictStore";
import type { Block } from "@/entities/block/model/types";

type UpdateBlockVariables = {
  blockId: string;
  content: unknown;
  baseVersion: number;
};

type PostgrestError = {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
};

export function useUpdateBlockMutation() {
  return useMutation<Block, PostgrestError, UpdateBlockVariables>({
    mutationFn: async (variables: UpdateBlockVariables) => {
      return updateBlockContent(
        variables.blockId,
        variables.content,
        variables.baseVersion,
      );
    },
    onSuccess: (data, variables) => {
      useDocumentStore.getState().setVersion(variables.blockId, data.version);
    },
    onError: async (error, variables) => {
      if (error.code === "PGRST116") {
        try {
          const serverBlock = await fetchBlock(variables.blockId);
          useConflictStore.getState().addConflict({
            blockId: variables.blockId,
            localContent: variables.content,
            serverContent: serverBlock.content,
            serverVersion: serverBlock.version,
          });
        } catch (fetchError) {
          console.error(
            "Failed to fetch latest block for conflict:",
            fetchError,
          );
        }
      } else {
        console.error("Failed to update block content:", error);
      }
    },
  });
}
