import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDocuments,
  createDocument,
  deleteDocument as deleteDocumentApi,
} from "@/entities/document/api";
import { fetchBlocks } from "@/entities/block/api";
import { useDocumentStore } from "./useDocumentStore";
import type { BlockNoteEditor } from "@blocknote/core";

type User = { id: string };

export function useDocumentManager(
  editor: BlockNoteEditor,
  user: User | null | undefined,
) {
  const queryClient = useQueryClient();

  const documentListQuery = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
    enabled: !!user,
  });

  const currentDocumentId = useDocumentStore(
    (state) => state.currentDocumentId,
  );

  const switchDocument = (documentId: string) => {
    useDocumentStore.getState().setCurrentDocumentId(documentId);
  };

  const blocksQuery = useQuery({
    queryKey: ["blocks", currentDocumentId],
    queryFn: async () => {
      const blocks = await fetchBlocks(currentDocumentId!);

      useDocumentStore.getState().setIsApplyingProgrammaticChange(true);

      if (blocks.length === 0) {
        editor.replaceBlocks(editor.document, [
          { type: "heading", content: "" },
        ] as never);
      } else {
        const blockNoteBlocks = blocks.map((b) => ({
          id: b.id,
          type: b.type,
          content: b.content,
        }));
        editor.replaceBlocks(editor.document, blockNoteBlocks as never);
      }

      setTimeout(() => {
        useDocumentStore.getState().setIsApplyingProgrammaticChange(false);
      }, 0);

      useDocumentStore.getState().setBlocks(blocks);

      return blocks;
    },
    enabled: !!currentDocumentId,
  });

  const createMutation = useMutation({
    mutationFn: () => createDocument("Untitled", user!.id),
    onSuccess: (newDocument) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      switchDocument(newDocument.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => deleteDocumentApi(documentId),
    onSuccess: (_data, deletedDocumentId) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });

      if (currentDocumentId === deletedDocumentId) {
        const remaining = documentListQuery.data?.filter(
          (d) => d.id !== deletedDocumentId,
        );
        if (remaining && remaining.length > 0) {
          switchDocument(remaining[0].id);
        } else {
          useDocumentStore.getState().setCurrentDocumentId(null);
        }
      }
    },
  });

  return {
    documentList: documentListQuery.data ?? [],
    currentDocumentId,
    isBlocksLoading: blocksQuery.isLoading,
    createNewDocument: createMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    switchDocument,
  };
}
