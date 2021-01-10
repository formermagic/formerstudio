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

export type Labels = string[];

export interface Sample {
  commit: Commit;
  repository: string;
  labels: Labels;
}

export interface Metadata {
  type: "metadata";
  timestamp: number | null;
  index: number | null;
  filename: string | null;
}

export interface InputData {
  samples: Sample[];
  metadata?: Metadata;
}

export type InputFile = File | null | undefined;
