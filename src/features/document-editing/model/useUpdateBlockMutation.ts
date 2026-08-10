import { useMutation } from "@tanstack/react-query";
import { updateBlockContent, fetchBlock } from "@/entities/block/api";
import { useDocumentStore } from "./useDocumentStore";
import type { Block } from "@/entities/block/model/types";

type UpdateBlockVariables = {
  blockId: string;
  content: unknown;
  baseVersion: number;
  isRetry?: boolean;
};

type PostgrestError = {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
};

export function useUpdateBlockMutation() {
  const mutation = useMutation<Block, PostgrestError, UpdateBlockVariables>({
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
      if (variables.isRetry) {
        if (error.code !== "PGRST116") {
          console.error("Failed to update block after retry:", error);
        }
        return;
      }

      if (error.code === "PGRST116") {
        try {
          const latestBlock = await fetchBlock(variables.blockId);
          mutation.mutate({
            blockId: variables.blockId,
            content: variables.content,
            baseVersion: latestBlock.version,
            isRetry: true,
          });
        } catch (fetchError) {
          console.error("Failed to fetch latest block for retry:", fetchError);
        }
      } else {
        console.error("Failed to update block content:", error);
      }
    },
  });

  return mutation;
}
