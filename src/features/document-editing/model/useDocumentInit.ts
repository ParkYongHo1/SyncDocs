import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import type { BlockNoteEditor } from "@blocknote/core";

import type { Document } from "@/entities/document/model/types";
import { createDocument, fetchDocuments } from "@/entities/document/api";
import { createBlock, fetchBlocks } from "@/entities/block/api";
import { useDocumentStore } from "./useDocumentStore";

type User = { id: string };

export function useDocumentInit(
  editor: BlockNoteEditor,
  user: User | null | undefined,
) {
  const query = useQuery({
    queryKey: ["document-init", user?.id],
    queryFn: async () => {
      const documents = await fetchDocuments();
      let document: Document;

      if (documents.length > 0) {
        document = documents.find((d) => !d.isReadonly) ?? documents[0];
      } else {
        document = await createDocument("Untitled", user!.id);
      }

      const blocks = await fetchBlocks(document.id);

      if (blocks.length === 0) {
        const blocksToCreate = editor.document;
        const createdBlocks = await Promise.all(
          blocksToCreate.map((block, index) =>
            createBlock({
              id: block.id,
              documentId: document.id,
              order: index,
              content: block.content,
            }),
          ),
        );
        useDocumentStore.getState().setBlocks(createdBlocks);
      } else {
        const blockNoteBlocks = blocks.map((b) => ({
          id: b.id,
          type: "paragraph",
          content: b.content,
        }));
        useDocumentStore.getState().setIsApplyingProgrammaticChange(true);
        editor.replaceBlocks(editor.document, blockNoteBlocks as never);
        setTimeout(() => {
          useDocumentStore.getState().setIsApplyingProgrammaticChange(false);
        }, 0);
        useDocumentStore.getState().setBlocks(blocks);
      }
      useDocumentStore.getState().setCurrentDocumentId(document.id);
      return document;
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  return {
    currentDocumentId: query.data?.id,
    isInitializing: query.isLoading,
  };
}
