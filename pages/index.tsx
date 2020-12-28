import { saveAs } from "file-saver";
import { NextPage } from "next";
import React, { useState } from "react";
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

const Index: NextPage = () => {
  const [metadata, setMetadata] = useState<Metadata | undefined>();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [index, setIndex] = useState<number | null>(null);

  const onNextClick = () => {
    const currentIndex = index ?? 0;
    setIndex(currentIndex + 1);
  };
  const onBackClick = () => {
    const currentIndex = index ?? 0;
    setIndex(currentIndex - 1);
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

  const onIndexSelected = (index: number | null) => {
    setIndex(index);
  };

  const onLabelSelected = (label: string | null) => {
    if (index != null) {
      const sample = samples[index];
      sample.labels = label ? [label] : [];
    }
  };

  return (
    <div>
      <StudioContainer
        labelOptions={options}
        onNextClick={onNextClick}
        onBackClick={onBackClick}
        onSaveClick={onSaveClick}
        onFileUploaded={onFileUploaded}
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
