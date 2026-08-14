import { useConflictStore } from "@/features/conflict-resolution/model/useConflictStore";
import { extractText } from "@/entities/block/lib/extract-text";
import type { ConflictInfo } from "@/features/conflict-resolution/model/useConflictStore";

type ConflictBannerProps = {
  conflict: ConflictInfo;
  onKeepLocal: (conflict: ConflictInfo) => void;
  onKeepServer: (conflict: ConflictInfo) => void;
};

export function ConflictBanner({
  conflict,
  onKeepLocal,
  onKeepServer,
}: ConflictBannerProps) {
  return (
    <div className="bg-[#3B1F1F] text-[#FDE2E2] px-4 py-3 rounded-lg border border-[#5A1A1A] space-y-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-[12px] text-[#FCA5A5]">Your version</p>
          <div className="bg-[#2A1414] rounded-md px-3 py-2 text-[13px] min-h-10">
            {extractText(conflict.localContent)}
          </div>
          <button
            onClick={() => {
              onKeepLocal(conflict);
              useConflictStore.getState().resolveConflict(conflict.blockId);
            }}
            className="w-full text-[12px] font-semibold bg-[#F87171] text-white px-3 py-1.5 rounded-md hover:bg-[#F87171]/80"
          >
            Keep this
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="text-[12px] text-[#FCA5A5]">Server version</p>
          <div className="bg-[#2A1414] rounded-md px-3 py-2 text-[13px] min-h-10">
            {extractText(conflict.serverContent)}
          </div>
          <button
            onClick={() => {
              onKeepServer(conflict);
              useConflictStore.getState().resolveConflict(conflict.blockId);
            }}
            className="w-full text-[12px] font-semibold bg-[#F87171] text-white px-3 py-1.5 rounded-md hover:bg-[#F87171]/80"
          >
            Keep this
          </button>
        </div>
      </div>
    </div>
  );
}
