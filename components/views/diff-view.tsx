import Prism from "prismjs";
import React from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import { Modification } from "../types";
import styles from "./diff-view.module.css";

const highlightSyntax = (
  languge: string
): ((source: string) => JSX.Element) => {
  return (source: string) => {
    if (!source) {
      return <pre />;
    }

    return (
      <pre
        style={{ display: "inline" }}
        dangerouslySetInnerHTML={{
          __html: Prism.highlight(source, Prism.languages[languge], languge),
        }}
      />
    );
  };
};

export interface Props {
  modification: Modification;
  language: string;
}

const DiffView: React.FC<Props> = (props) => {
  let shouldSplit: boolean;
  let leftTitle: string | undefined;
  if (
    props.modification.oldContent &&
    props.modification.oldContent.length !== 0
  ) {
    shouldSplit = true;
    leftTitle = props.modification.oldFilepath;
  } else {
    shouldSplit = false;
    leftTitle = props.modification.newFilepath;
  }

  return (
    <div className={styles.container}>
      <ReactDiffViewer
        oldValue={props.modification.oldContent}
        newValue={props.modification.newContent}
        splitView={shouldSplit}
        compareMethod={DiffMethod.WORDS}
        renderContent={highlightSyntax(props.language)}
        leftTitle={leftTitle}
        rightTitle={props.modification.newFilepath}
      />
    </div>
  );
};

export default DiffView;
