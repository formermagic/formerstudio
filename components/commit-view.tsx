import styles from "./commit-view.module.css";
import DiffContainer, { DiffContainerProps } from "./diff-container";

export interface CommitViewProps {
  commitMessage: string;
  diffContainerProps: DiffContainerProps;
}

export default function CommitView({
  commitMessage,
  diffContainerProps,
}: CommitViewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.messageContainer}>
        <div className={styles.messageTitle}>{commitMessage}</div>
      </div>
      <DiffContainer diffViewProps={diffContainerProps.diffViewProps} />
    </div>
  );
}
