export type Block = {
  id: string;
  documentId: string;
  order: number;
  content: unknown;
  type: string;
  version: number;
  updatedBy: string;
  updatedAt: number;
  deletedAt: number | null;
};
