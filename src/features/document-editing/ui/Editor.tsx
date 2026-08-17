"use client";

import { useState } from "react";
import { WelcomeSection } from "./WelcomeSection";
import { Sidebar } from "./Sidebar";
import { EditorHeader } from "./Editorheader";
import { ConflictBanner } from "./Conflictbanner";
import { useCurrentUser } from "@/entities/auth/model/useCurrentUser";
import { useSignInMutation } from "@/entities/auth/model/useSignInMutation";
import { useSignOutMutation } from "@/entities/auth/model/useSignOutMutation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEditorSync } from "../model/useEditorSync";
import { useDocumentManager } from "../model/useDocumentManager";
import {
  useConflictStore,
  type ConflictInfo,
} from "@/features/conflict-resolution/model/useConflictStore";
import { useDocumentStore } from "../model/useDocumentStore";
import { useOnlineStatus } from "../model/useOnlineStatus";
import { Menu } from "lucide-react";

const customDarkTheme = {
  colors: {
    editor: {
      text: "#E3E3E3",
      background: "transparent",
    },
    menu: {
      text: "#E3E3E3",
      background: "#1A1A1A",
    },
  },
};

export default function Editor() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: signIn } = useSignInMutation();
  const { mutate: signOut } = useSignOutMutation();

  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "heading",
        content: "",
      },
    ],
    placeholders: {
      heading: "새 파일",
      default: "내용을 입력하세요...",
    },
  });

  const {
    onCompositionStart,
    onCompositionEnd,
    applyContent,
    updateBlockMutate,
  } = useEditorSync(editor);

  const {
    documentList,
    currentDocumentId,
    createNewDocument,
    deleteDocument,
    deleteAllMyDocuments,
    switchDocument,
    updateTitle,
  } = useDocumentManager(editor, user);

  const conflicts = useConflictStore((state) => state.conflicts);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useOnlineStatus();
  const isOnline = useDocumentStore((state) => state.isOnline);

  const currentDocument = documentList.find(
    (doc) => doc.id === currentDocumentId,
  );

  const handleDeleteDocument = (e: React.MouseEvent, documentId: string) => {
    e.stopPropagation();
    if (!confirm("이 문서를 삭제할까요?")) return;
    deleteDocument(documentId);
  };

  const handleSwitchDocument = (documentId: string) => {
    switchDocument(documentId);
    setIsSidebarOpen(false);
  };

  const handleGoToWelcome = () => {
    useDocumentStore.getState().setCurrentDocumentId(null);
    setIsSidebarOpen(false);
  };

  const handleKeepLocal = (conflict: ConflictInfo) => {
    applyContent(conflict.blockId, conflict.localContent, {
      skipServerSync: true,
    });
    updateBlockMutate({
      blockId: conflict.blockId,
      content: conflict.localContent,
      baseVersion: conflict.serverVersion,
    });
  };

  const handleKeepServer = (conflict: ConflictInfo) => {
    applyContent(conflict.blockId, conflict.serverContent, {
      skipServerSync: true,
    });
  };
  const handleLogout = async () => {
    await deleteAllMyDocuments();
    signOut();
  };
  if (isLoading) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D0D0D] text-[#E3E3E3]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        documentList={documentList}
        currentDocumentId={currentDocumentId ?? null}
        onCreateDocument={() => createNewDocument()}
        onSwitchDocument={handleSwitchDocument}
        onDeleteDocument={handleDeleteDocument}
        onGoToWelcome={handleGoToWelcome}
        onLogin={() => signIn()}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {user && currentDocumentId ? (
          <>
            <EditorHeader
              currentDocument={currentDocument}
              user={user}
              isOnline={isOnline}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onSaveTitle={(title) =>
                updateTitle({ documentId: currentDocumentId, title })
              }
            />

            <main className="flex-1 overflow-y-auto">
              <div className="px-4 md:px-8 py-6 md:py-10 max-w-4xl mx-auto space-y-4">
                {conflicts.map((conflict) => (
                  <ConflictBanner
                    key={conflict.blockId}
                    conflict={conflict}
                    onKeepLocal={handleKeepLocal}
                    onKeepServer={handleKeepServer}
                  />
                ))}

                <div
                  onCompositionStart={onCompositionStart}
                  onCompositionEnd={onCompositionEnd}
                >
                  <BlockNoteView
                    editor={editor}
                    theme={customDarkTheme}
                    editable={!currentDocument?.isReadonly}
                  />
                </div>
              </div>
            </main>
          </>
        ) : (
          <main className="flex-1 overflow-y-auto">
            <div className="md:hidden px-4 py-3 border-b border-[#1F1F1F]">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 text-gray-400 hover:text-white"
                aria-label="메뉴 열기"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            {!user && <WelcomeSection />}
          </main>
        )}
      </div>
    </div>
  );
}
