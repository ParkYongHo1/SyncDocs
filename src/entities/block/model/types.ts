export type Block = {
  id: string;
  documentId: string;
  order: number;
  content: unknown;
  version: number;
  updatedBy: string;
  updatedAt: number;
  deletedAt: number | null;
};
