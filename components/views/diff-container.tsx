import React from "react";
import { Modification } from "../types";
import DiffView from "./diff-view";

interface Props {
  modifications: Modification[];
}

const DiffContainer: React.FC<Props> = (props) => {
  const convertMods = (modification: Modification, index: number) => {
    const language = "python";
    return (
      <DiffView
        key={`diffview-${index}`}
        modification={modification}
        language={language}
      />
    );
  };

  return <div>{props.modifications.map(convertMods)}</div>;
};

export default DiffContainer;
