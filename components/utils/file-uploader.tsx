import { Button, ButtonProps } from "@primer/components";
import React, { BaseSyntheticEvent } from "react";
import { InputFile } from "../types";

interface Props extends ButtonProps {
  handleFile: (file: InputFile) => void;
}

const FileUploader: React.FC<Props> = (props) => {
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | BaseSyntheticEvent
  ) => {
    const fileUploaded = event.target.files?.item(0);
    props.handleFile(fileUploaded);

    // Reset the file input
    event.target.value = null;
  };

  return (
    <>
      <Button {...props} onClick={handleClick}>
        {props.children}
      </Button>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </>
  );
};

export default FileUploader;
