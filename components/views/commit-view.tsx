import React from "react";
import { Sample } from "../types";
import styles from "./commit-view.module.css";
import DiffContainer from "./diff-container";

interface Props {
  samples: Sample[];
  index: number | null;
}

const CommitView: React.FC<Props> = (props) => {
  if (props.samples.length === 0) {
    return <div className={styles.container} />;
  }

  const index = props.index ?? 0;
  const commit = props.samples[index].commit;

  return (
    <div className={styles.container}>
      <div className={styles.messageContainer}>
        <div className={styles.messageTitle}>{commit.message}</div>
      </div>
      <DiffContainer modifications={commit.modifications} />
    </div>
  );
};

export default CommitView;
