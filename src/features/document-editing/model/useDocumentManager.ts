import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDocuments,
  createDocument,
  deleteDocument as deleteDocumentApi,
  updateDocumentTitle,
} from "@/entities/document/api";
import { createBlock, fetchBlocks } from "@/entities/block/api";
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

  const sortedDocumentList = [...(documentListQuery.data ?? [])].sort(
    (a, b) => {
      if (a.isReadonly && !b.isReadonly) return -1;
      if (!a.isReadonly && b.isReadonly) return 1;
      return 0;
    },
  );

  const currentDocumentId = useDocumentStore(
    (state) => state.currentDocumentId,
  );

  const switchDocument = (documentId: string) => {
    useDocumentStore.getState().setCurrentDocumentId(documentId);
  };

  useEffect(() => {
    if (user && sortedDocumentList.length > 0 && !currentDocumentId) {
      useDocumentStore
        .getState()
        .setCurrentDocumentId(sortedDocumentList[0].id);
    }
  }, [user, sortedDocumentList, currentDocumentId]);

  const blocksQuery = useQuery({
    queryKey: ["blocks", currentDocumentId],
    queryFn: async () => {
      const blocks = await fetchBlocks(currentDocumentId!);

      useDocumentStore.getState().setIsApplyingProgrammaticChange(true);

      if (blocks.length === 0) {
        editor.replaceBlocks(editor.document, [
          { type: "heading", content: "" },
        ] as never);

        const newBlock = editor.document[0];
        const createdBlock = await createBlock({
          id: newBlock.id,
          documentId: currentDocumentId!,
          order: 0,
          content: newBlock.content,
          type: newBlock.type,
        });
        useDocumentStore.getState().setBlocks([createdBlock]);
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
    refetchOnReconnect: false,
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
        const remaining = sortedDocumentList.filter(
          (d) => d.id !== deletedDocumentId,
        );
        if (remaining.length > 0) {
          switchDocument(remaining[0].id);
        } else {
          useDocumentStore.getState().setCurrentDocumentId(null);
        }
      }
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: ({
      documentId,
      title,
    }: {
      documentId: string;
      title: string;
    }) => updateDocumentTitle(documentId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  return {
    documentList: sortedDocumentList,
    currentDocumentId,
    isBlocksLoading: blocksQuery.isLoading,
    createNewDocument: createMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    switchDocument,
    updateTitle: updateTitleMutation.mutate,
  };
}
