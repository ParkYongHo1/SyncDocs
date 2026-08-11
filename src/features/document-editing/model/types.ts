export type UpdateBlockVariables = {
  blockId: string;
  content: unknown;
  baseVersion: number;
};

export type PendingAction =
  | {
      type: "insert";
      blockId: string;
      documentId: string;
      order: number;
      content: unknown;
      blockType: string;
    }
  | { type: "update"; blockId: string; content: unknown; baseVersion: number }
  | { type: "delete"; blockId: string }
  | { type: "restore"; blockId: string };
