import DiffView, { DiffViewProps } from "./diff-view";

export interface DiffContainerProps {
  diffViewProps: DiffViewProps[];
}

export default function DiffContainer({ diffViewProps }: DiffContainerProps) {
  return (
    <div>
      {diffViewProps.map((diffProps, index) => (
        <DiffView
          key={`diffview-${index}`}
          language={diffProps.language}
          oldContent={diffProps.oldContent}
          newContent={diffProps.newContent}
          leftTitle={diffProps.leftTitle}
          rightTitle={diffProps.rightTitle}
        />
      ))}
    </div>
  );
}
