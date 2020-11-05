import Head from "next/head";
import React from "react";
import CommitView from "../components/commit-view";
import StudioContainer from "../components/studio-container";

const oldCode = `
const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')
`;

const newCode = `
const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}
`;

const diffProps = [
  {
    language: "javascript",
    oldContent: oldCode,
    newContent: newCode,
    leftTitle: "file1.py",
    rightTitle: "file2.py",
  },
  {
    language: "javascript",
    oldContent: oldCode,
    newContent: newCode,
    leftTitle: "file1.py",
    rightTitle: "file2.py",
  },
  {
    language: "javascript",
    oldContent: `export default function DiffView({
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
    }`,
    newContent: newCode,
    leftTitle: "file1.py",
    rightTitle: "file2.py",
  },
  {
    language: "python",
    oldContent: `def dataset_dest_filepath(filepath_prefix: Text, extension: Text) -> Text:
    filename = os.path.basename(filepath_prefix)
    filename = filename.split(".")
    filename, exts = filename[0], filename[1:]
    dirname = os.path.dirname(filepath_prefix)
    exts = ".".join(exts)
    exts = f".{exts}" if exts else ""
    extension = f".{extension}" if extension else ""
    return os.path.join(dirname, f"{filename}{exts}{extension}")`,
    newContent: `def dataset_dest_filepath(filepath_prefix: Text, extension: Text) -> Text:
    filename = os.path.basename(filepath_prefix)
    filename = filename.split(".")`,
    leftTitle: "file1.py",
    rightTitle: "file2.py",
  },
];

const options = [{ value: "feat", label: "Feature" }];

export default function Home() {
  return (
    <div>
      <Head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/prism.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/prism.min.js" />
      </Head>
      <StudioContainer selectOptions={options}>
        <CommitView
          commitMessage="Alalala"
          diffContainerProps={{ diffViewProps: diffProps }}
        />
      </StudioContainer>
    </div>
  );
}
