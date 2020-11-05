import Prism from "prismjs";
import React from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import styles from "./diff-view.module.css";

function highlightSyntax(languge: string): any {
  return (text: string) => {
    if (!text) {
      return <pre />;
    }

    return (
      <pre
        style={{ display: "inline" }}
        dangerouslySetInnerHTML={{
          __html: Prism.highlight(text, Prism.languages[languge], languge),
        }}
      />
    );
  };
}

export interface DiffViewProps {
  language: string;
  oldContent: string;
  newContent: string;
  leftTitle?: string;
  rightTitle?: string;
}

export default function DiffView({
  language,
  oldContent,
  newContent,
  leftTitle,
  rightTitle,
}: DiffViewProps) {
  return (
    <div className={styles.container}>
      <ReactDiffViewer
        oldValue={oldContent}
        newValue={newContent}
        splitView={true}
        compareMethod={DiffMethod.WORDS}
        renderContent={highlightSyntax(language)}
        leftTitle={leftTitle}
        rightTitle={rightTitle}
      />
    </div>
  );
}
