export type Command = {
  id: string;
  blockId: string;
  description: string;
  execute: () => void;
  undo: () => void;
};
