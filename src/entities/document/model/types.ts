export type Document = {
  id: string;
  title: string;
  ownerId: string | null;
  createdAt: number;
  updatedAt: number;
  isReadonly: boolean;
};
