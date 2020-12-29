import { saveAs } from "file-saver";
import localForage from "localforage";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import {
  Commit,
  InputData,
  InputFile,
  Metadata,
  Sample,
} from "../components/types";
import CommitView from "../components/views/commit-view";
import StudioContainer from "../components/views/studio-container";
import camelCaseKeysToUnderscore from "../lib/converters";
import { DataParser } from "../lib/parsers";

type MetadataType = Metadata | undefined;
type IndexType = number | null;

const deepCopy = <T extends unknown>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const options = [
  {
    value: "feat",
    label: "[feat]: a new feature (modifies the behavior of a program)",
  },
  {
    value: "refactor",
    label:
      "[refactor]: a code change that neither fixes a bug nor adds a feature",
  },
  { value: "fix", label: "[fix]: a bug fix" },
  {
    value: "test",
    label: "[test]: adding missing tests or correcting existing tests",
  },
  {
    value: "chore",
    label: "[chore]: other changes that don't modify src or test files",
  },
  {
    value: "build",
    label:
      "[build]: changes that affect the build system or external dependencies",
  },
  { value: "docs", label: "[docs]: documentation only changes (in code)" },
  {
    value: "style",
    label: "[style]: changes that do not affect the meaning of the code",
  },
  { value: "[perf]", label: "[perf]: a code change that improves performance" },
];

const parser = new DataParser();

class StateMemory {
  metadataKey: string;
  samplesKey: string;
  indexKey: string;

  constructor(
    metadataKey: string = "local-metadata",
    samplesKey: string = "local-samples",
    indexKey: string = "local-index"
  ) {
    this.metadataKey = metadataKey;
    this.samplesKey = samplesKey;
    this.indexKey = indexKey;
  }

  async restore(): Promise<{
    metadata: MetadataType;
    samples: Sample[];
    commits: Commit[];
    index: IndexType;
  }> {
    const metadata = await localForage.getItem<MetadataType>(this.metadataKey);
    const samples = await localForage.getItem<Sample[]>(this.samplesKey);
    const commits = (samples ?? []).map((sample) => sample.commit);
    const index = await localForage.getItem<IndexType>(this.indexKey);

    const result = {
      metadata: metadata ?? undefined,
      samples: samples ?? [],
      commits: commits,
      index: index,
    };

    return Promise.resolve(result);
  }
}

const Index: NextPage = () => {
  const [metadata, setMetadata] = useState<MetadataType>();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [index, setIndex] = useState<IndexType>(null);

  const onNextClick = () => {
    const maxIndex = samples.length - 1;
    const currentIndex = (index ?? 0) + 1;
    setIndex(Math.min(maxIndex, currentIndex));
  };
  const onBackClick = () => {
    const minIndex = 0;
    const currentIndex = (index ?? 0) - 1;
    setIndex(Math.max(minIndex, currentIndex));
  };

  const onSaveClick = async () => {
    // Prepare JSON lines for samples
    const jsonLines = samples.map((sample) => {
      const copy = JSON.parse(JSON.stringify(sample));
      return JSON.stringify(camelCaseKeysToUnderscore(copy));
    });

    // Prepare JSON lines for metadata
    const newMetadata: Metadata = {
      type: "metadata",
      timestamp: Math.floor(Date.now() / 1000),
      index: index,
    };
    const metadataCopy = JSON.parse(JSON.stringify(newMetadata));
    const metadata = JSON.stringify(camelCaseKeysToUnderscore(metadataCopy));
    setMetadata(newMetadata);

    // Combine both samples and metadata in bytes blob
    const blob = new Blob([[metadata, ...jsonLines].join("\n")], {
      type: "text/plain",
    });

    // Save blob as file
    saveAs(blob, "checkpoint.jsonl");
  };

  const onClearClick = () => {
    setMetadata(undefined);
    setSamples([]);
    setCommits([]);
    setIndex(null);

    // Clear db written data
    localForage.clear();
  };

  const onFileUploaded = async (file: InputFile) => {
    const inputData = (await parser.parse(file)) as InputData;
    const samples = inputData.samples;
    const commits = samples.map((sample) => sample.commit);

    setMetadata(inputData.metadata);
    setSamples(samples);
    setCommits(commits);

    if (inputData.metadata) {
      setIndex(inputData.metadata.index ?? 0);
    } else {
      setIndex(0);
    }
  };

  const onIndexDeleted = (index: number | null) => {
    // TODO: show deletion alert
    const newSamples = samples.filter((_sample, idx) => index !== idx);
    const newCommits = newSamples.map((sample) => sample.commit);
    setSamples(newSamples);
    setCommits(newCommits);
    setIndex(index);
  };

  const onIndexSelected = (index: number | null) => {
    setIndex(index);
  };

  const onLabelSelected = (label: string | null) => {
    if (index != null) {
      const sample = samples[index];
      sample.labels = label ? [label] : [];

      // Force samples to be updated
      setSamples(deepCopy(samples));
    }
  };

  // Session state for identifying readiness to update
  const [sessionInitiated, setSessionInitiated] = useState(false);

  useEffect(() => {
    // Configure the db
    localForage.config({
      driver: localForage.INDEXEDDB,
      name: "formerstudio-web",
      version: 1.0,
      size: 1e8,
      storeName: "key_value_pairs",
      description: "some description",
    });

    // Restore written data if any
    const memory = new StateMemory();
    memory.restore().then((result) => {
      setMetadata(result.metadata);
      setSamples(result.samples);
      setCommits(result.commits);
      setIndex(result.index);

      setSessionInitiated(true);
    });
  }, []);

  // Write updated samples to the db
  useEffect(() => {
    if (sessionInitiated) {
      localForage.setItem("local-samples", samples);
    }
  }, [samples]);

  // Write updated metadata to the db
  useEffect(() => {
    if (sessionInitiated) {
      localForage.setItem("local-metadata", metadata);
    }
  }, [metadata]);

  // Write updated index to the db
  useEffect(() => {
    if (sessionInitiated) {
      localForage.setItem("local-index", index);
    }
  }, [index]);

  return (
    <div>
      <StudioContainer
        labelOptions={options}
        onNextClick={onNextClick}
        onBackClick={onBackClick}
        onSaveClick={onSaveClick}
        onClearClick={onClearClick}
        onFileUploaded={onFileUploaded}
        onIndexDeleted={onIndexDeleted}
        onIndexSelected={onIndexSelected}
        onLabelSelected={onLabelSelected}
        metadata={metadata}
        samples={samples}
        commits={commits}
        index={index}
        setIndex={setIndex}
      >
        <CommitView commits={commits} index={index} />
      </StudioContainer>
    </div>
  );
};

export default Index;
