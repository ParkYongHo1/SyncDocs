import { useState } from "react";
import { Undo2, Redo2, CheckCircle2, WifiOff, Menu } from "lucide-react";
import { useHistoryStore } from "@/features/undo-redo/model/useHistoryStore";
import type { Document } from "@/entities/document/model/types";

type User = { id: string };

type EditorHeaderProps = {
  currentDocument: Document | undefined;
  user: User | null | undefined;
  isOnline: boolean;
  onOpenSidebar: () => void;
  onSaveTitle: (title: string) => void;
};

export function EditorHeader({
  currentDocument,
  user,
  isOnline,
  onOpenSidebar,
  onSaveTitle,
}: EditorHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const isOwner = currentDocument?.ownerId === user?.id;

  const handleTitleSave = () => {
    if (titleDraft.trim()) {
      onSaveTitle(titleDraft);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 border-b border-[#1F1F1F] flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="md:hidden shrink-0 p-1.5 text-gray-400 hover:text-white"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </button>

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
              if (!currentDocument || !isOwner) return;
              setTitleDraft(currentDocument.title);
              setIsEditingTitle(true);
            }}
            className={`text-[14px] font-semibold text-white truncate ${
              isOwner ? "cursor-pointer hover:text-gray-300" : ""
            }`}
          >
            {currentDocument?.title ?? "Untitled"}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
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
          <div className="flex items-center gap-1.5 text-[12px] font-medium px-2 md:px-3 py-1 rounded-full bg-[#18261F] text-[#4ade80] border border-[#1e3a27]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[12px] font-medium px-2 md:px-3 py-1 rounded-full bg-[#2A1414] text-[#F87171] border border-[#5A1A1A]">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}
      </div>
    </header>
  );
}
