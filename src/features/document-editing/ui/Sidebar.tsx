import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileText, X } from "lucide-react";
import type { Document } from "@/entities/document/model/types";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string } | null | undefined;
  documentList: Document[];
  currentDocumentId: string | null;
  onCreateDocument: () => void;
  onSwitchDocument: (documentId: string) => void;
  onDeleteDocument: (e: React.MouseEvent, documentId: string) => void;
  onGoToWelcome: () => void;
  onLogin: () => void;
  onLogout: () => void;
};

export function Sidebar({
  isOpen,
  onClose,
  user,
  documentList,
  currentDocumentId,
  onCreateDocument,
  onSwitchDocument,
  onDeleteDocument,
  onGoToWelcome,
  onLogin,
  onLogout,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static z-50 h-full w-64 shrink-0 flex flex-col
          border-r border-[#1F1F1F] bg-[#141414] overflow-y-auto
          transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="px-6 py-5 flex items-center justify-between">
          <span className="text-[14px] font-bold tracking-tight text-white">
            SyncDocs Space
          </span>
          <div className="flex items-center gap-1">
            {user && (
              <button
                onClick={onCreateDocument}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-[#222]"
                aria-label="새 문서"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-[#222]"
              aria-label="메뉴 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1.5">
          {!user && (
            <button
              onClick={onGoToWelcome}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] text-left ${
                !currentDocumentId
                  ? "bg-[#222] text-white font-semibold border border-[#2D2D2D]"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#1A1A1A] font-medium"
              }`}
            >
              Welcome to SyncDocs
            </button>
          )}

          {user &&
            documentList.map((doc) => {
              const active = doc.id === currentDocumentId;
              const isOwner = doc.ownerId === user.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => onSwitchDocument(doc.id)}
                  className={`group w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-[14px] text-left ${
                    active
                      ? "bg-[#222] text-white font-semibold border border-[#2D2D2D]"
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#1A1A1A] font-medium"
                  }`}
                >
                  <span className="flex items-center min-w-0">
                    <FileText
                      className={`w-4 h-4 shrink-0 inline mr-2.5 ${
                        active ? "text-blue-400" : "text-gray-600"
                      }`}
                    />
                    <span className="truncate">{doc.title}</span>
                  </span>
                  {isOwner && (
                    <Trash2
                      onClick={(e) => onDeleteDocument(e, doc.id)}
                      className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400"
                    />
                  )}
                </button>
              );
            })}
        </nav>
        {user ? (
          <div className="p-3 border-t border-[#1F1F1F]">
            <Button
              onClick={onLogout}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="p-3 border-t border-[#1F1F1F]">
            <Button
              onClick={onLogin}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Start Demo
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
