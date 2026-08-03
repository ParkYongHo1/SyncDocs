export type ConflictInfo = {
  blockId: string;
  localContent: unknown;
  serverContent: unknown;
  serverVersion: number;
};
