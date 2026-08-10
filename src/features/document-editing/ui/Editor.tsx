"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Undo2, Redo2, CheckCircle2, WifiOff } from "lucide-react";
import { WelcomeSection } from "./WelcomeSection";
import { useCurrentUser } from "@/entities/auth/model/useCurrentUser";
import { useSignInMutation } from "@/entities/auth/model/useSignInMutation";
import { useSignOutMutation } from "@/entities/auth/model/useSignOutMutation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useHistoryStore } from "@/features/undo-redo/model/useHistoryStore";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEditorSync } from "../model/useEditorSync";
import { useDocumentInit } from "../model/useDocumentInit";
import { useConflictStore } from "@/features/conflict-resolution/model/useConflictStore";
import { extractText } from "@/entities/block/lib/extract-text";

const dummyDocuments = [
  { id: "1", title: "Q3 launch plan" },
  { id: "2", title: "Onboarding redesign spec" },
];

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

const currentDocument = { title: "Untitled", isReadonly: false };

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
  const { currentDocumentId, isInitializing } = useDocumentInit(editor, user);
  const conflicts = useConflictStore((state) => state.conflicts);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [isOnline] = useState(true);

  const handleLogin = () => {
    signIn();
  };

  const handleLogout = () => {
    signOut();
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D0D0D] text-[#E3E3E3]">
      <aside className="w-64 shrink-0 flex flex-col border-r border-[#1F1F1F] bg-[#141414] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between">
          <span className="text-[14px] font-bold tracking-tight text-white">
            SyncDocs Space
          </span>
          {user && (
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-[#222]">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] text-left bg-[#222] text-white font-semibold border border-[#2D2D2D]">
            Welcome to SyncDocs
          </button>

          {user &&
            dummyDocuments.map((doc) => (
              <button
                key={doc.id}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] text-left text-gray-500 hover:text-gray-300 hover:bg-[#1A1A1A] font-medium"
              >
                {doc.title}
              </button>
            ))}
        </nav>
        {user ? (
          <div className="p-3 border-t border-[#1F1F1F]">
            <Button
              onClick={handleLogout}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="p-3 border-t border-[#1F1F1F]">
            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Start Demo
            </Button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {user ? (
          <>
            <header className="h-14 border-b border-[#1F1F1F] flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center gap-3">
                {isEditingTitle ? (
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTitleSave();
                      if (e.key === "Escape") setIsEditingTitle(false);
                    }}
                    className="text-[14px] font-semibold text-white bg-[#1A1A1A] border border-[#2D2D2D] rounded-md px-2 py-1 outline-none focus:border-blue-500"
                  />
                ) : (
                  <h1
                    onClick={() => {
                      if (!currentDocument || currentDocument.isReadonly)
                        return;
                      setTitleDraft(currentDocument.title);
                      setIsEditingTitle(true);
                    }}
                    className={`text-[14px] font-semibold text-white ${
                      currentDocument && !currentDocument.isReadonly
                        ? "cursor-pointer hover:text-gray-300"
                        : ""
                    }`}
                  >
                    {currentDocument?.title ?? "Untitled"}
                  </h1>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-[#1A1A1A] p-0.5 rounded-lg border border-[#2A2A2A]">
                  <button
                    onClick={() => useHistoryStore.getState().undo()}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#262626]"
                    aria-label="실행 취소"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => useHistoryStore.getState().redo()}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#262626]"
                    aria-label="다시 실행"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {isOnline ? (
                  <div className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1 rounded-full bg-[#18261F] text-[#4ade80] border border-[#1e3a27]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Online
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1 rounded-full bg-[#2A1414] text-[#F87171] border border-[#5A1A1A]">
                    <WifiOff className="w-3.5 h-3.5" />
                    Offline
                  </div>
                )}
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">
              <div className="px-8 py-10 max-w-4xl mx-auto space-y-4">
                {conflicts.map((conflict) => (
                  <div
                    key={conflict.blockId}
                    className="bg-[#3B1F1F] text-[#FDE2E2] px-4 py-3 rounded-lg border border-[#5A1A1A] space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-[#F87171]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-[14px] font-medium">
                        This block has a conflict.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <p className="text-[12px] text-[#FCA5A5]">
                          Your version
                        </p>
                        <div className="bg-[#2A1414] rounded-md px-3 py-2 text-[13px] min-h-10">
                          {extractText(conflict.localContent)}
                        </div>
                        <button
                          onClick={() => {
                            applyContent(
                              conflict.blockId,
                              conflict.localContent,
                              { skipServerSync: true },
                            );
                            updateBlockMutate({
                              blockId: conflict.blockId,
                              content: conflict.localContent,
                              baseVersion: conflict.serverVersion,
                            });
                            useConflictStore
                              .getState()
                              .resolveConflict(conflict.blockId);
                          }}
                          className="w-full text-[12px] font-semibold bg-[#F87171] text-white px-3 py-1.5 rounded-md hover:bg-[#F87171]/80"
                        >
                          Keep this
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[12px] text-[#FCA5A5]">
                          Server version
                        </p>
                        <div className="bg-[#2A1414] rounded-md px-3 py-2 text-[13px] min-h-10">
                          {extractText(conflict.serverContent)}
                        </div>
                        <button
                          onClick={() => {
                            applyContent(
                              conflict.blockId,
                              conflict.serverContent,
                              { skipServerSync: true },
                            );
                            useConflictStore
                              .getState()
                              .resolveConflict(conflict.blockId);
                          }}
                          className="w-full text-[12px] font-semibold bg-[#F87171] text-white px-3 py-1.5 rounded-md hover:bg-[#F87171]/80"
                        >
                          Keep this
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  onCompositionStart={onCompositionStart}
                  onCompositionEnd={onCompositionEnd}
                >
                  <BlockNoteView editor={editor} theme={customDarkTheme} />
                </div>
              </div>
            </main>
          </>
        ) : (
          <main className="flex-1 overflow-y-auto">
            <WelcomeSection />
          </main>
        )}
      </div>
    </div>
  );
}
