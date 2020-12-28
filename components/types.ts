export interface Modification {
  oldFilepath?: string;
  newFilepath?: string;
  oldContent?: string;
  newContent?: string;
}

export interface Commit {
  hash: string;
  message: string;
  modifications: Modification[];
}

export interface Sample {
  commit: Commit;
  repository: string;
  labels: string[];
}

export interface Metadata {
  type: "metadata";
  timestamp: number | null;
  index: number | null;
}

export interface InputData {
  samples: Sample[];
  metadata?: Metadata;
}

export type InputFile = File | null | undefined;
