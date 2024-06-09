export type SblNode =
  | {
      name: string;
      upstamp: number;
      len: number;
    }
  | {
      name: string;
      children: SblNode[];
    };

export type SblFolderNodeAssert = Extract<SblNode, { children: SblNode[] }>;

export type SblFileNodeAssert = Exclude<SblNode, { children: SblNode[] }>;
