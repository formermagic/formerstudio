import {
  Box,
  Button,
  ButtonDanger,
  ButtonGroup,
  ButtonPrimary,
  ButtonProps,
  Dialog,
  ProgressBar,
  Text,
} from "@primer/components";
import { format } from "date-fns";
import React, { Fragment, useState } from "react";
import NumberFormat from "react-number-format";
import Select, { createFilter, OptionsType } from "react-select";
import { InputFile, Metadata, Sample } from "../types";
import FileUploader from "../utils/file-uploader";
import styles from "./studio-container.module.css";

type Options = { value: string; label: string };

const Time = ({ timestamp }: { timestamp: number | null }) => {
  if (!timestamp) {
    return <time>Never</time>;
  }

  const date = new Date(timestamp * 1000);
  return <div>{format(date, "MM/dd/yyyy  hh:mm:ss")}</div>;
};

const Number = ({ value }: { value: number }) => {
  return (
    <NumberFormat value={value} displayType={"text"} thousandSeparator={true} />
  );
};

export enum FilterState {
  ALL,
  ONLY_FINISHED,
  ONLY_UNFINISHED,
}

interface Props {
  children?: React.ReactNode;
  labelOptions: OptionsType<Options>;

  onNextClick: () => void;
  onBackClick: () => void;
  onSaveClick: () => void;
  onClearClick: () => void;
  onIndexDeleted: (index: number | null) => void;
  onIndexSelected: (index: number | null) => void;
  onFileUploaded: (file: InputFile) => void;
  onLabelSelected: (label: string | null) => void;
  onFilterApply: (filter: FilterState) => void;

  metadata?: Metadata;
  samples: Sample[];
  index: number | null;
  setIndex: (value: number | null) => void;
}

interface DeleteButtonProps extends ButtonProps {
  handleAccept?: (_event?: any) => void;
  handleDeny?: (_event?: any) => void;
}

const DeleteButton = (props: DeleteButtonProps) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <ButtonDanger {...props} onClick={handleShow}>
        {props.children}
      </ButtonDanger>
      <Dialog isOpen={show} onDismiss={handleClose}>
        <Dialog.Header>Deletion Alert</Dialog.Header>
        <Box p={3}>
          <Text fontFamily="sans-serif">
            Are you sure you want to delete the record? This cannot be undone
          </Text>
        </Box>
        <div>
          <Button
            width="100px"
            marginLeft="16px"
            marginBottom="16px"
            onClick={() => {
              handleClose();
              if (props.handleDeny) props.handleDeny();
            }}
          >
            No
          </Button>
          <ButtonDanger
            width="100px"
            marginLeft="8px"
            marginBottom="16px"
            onClick={() => {
              handleClose();
              if (props.handleAccept) props.handleAccept();
            }}
          >
            Yes
          </ButtonDanger>
        </div>
      </Dialog>
    </>
  );
};

const StudioContainer: React.FC<Props> = (props) => {
  // Navigation items
  const navigationItems = props.samples.map((sample, index) => {
    const labels = sample.labels;
    const isCompleted = labels.length !== 0;
    const prefix = isCompleted ? "✅" : "🚫";
    return {
      value: `${index}`,
      label: `${prefix} item #${index}`,
    };
  });

  // Update selected navigation preview item
  const [indexPreview, setIndexPreview] = useState<number | null>(null);
  const onNavigationChange = (option: OptionsType<Options> | any) => {
    if (option != null) {
      setIndexPreview(parseInt(option.value));
    }
  };

  // Selected navigation option
  let navigationItem: Options | null = null;
  if (indexPreview != null) {
    navigationItem = navigationItems[indexPreview];
  } else if (props.index != null) {
    if (props.samples.length !== 0)
      navigationItem = navigationItems[props.index];
  }

  // Update selected label
  const [labelPreview, setLabelPreview] = useState<Options | null>(null);
  const onLabelChange = (option: OptionsType<Options> | any) => {
    if (option != null) {
      setLabelPreview(option);
      props.onLabelSelected(option.value);
    } else {
      setLabelPreview(null);
      props.onLabelSelected(null);
    }
  };

  // Selected label option
  let labelItem: Options | null = null;
  if (labelPreview != null) {
    labelItem = labelPreview;
  } else if (props.index != null) {
    if (props.samples.length !== 0) {
      const sample = props.samples[props.index];
      const labels = sample.labels;
      if (labels.length !== 0) {
        const matchingItems = props.labelOptions.filter(
          (option) => option.value === labels[0]
        );

        labelItem = matchingItems[0];
      }
    }
  }

  // Navigation side panel UI callbacks
  const onConfirm = (_event: any) => {
    if (indexPreview != null) {
      props.onIndexSelected(indexPreview);
      setIndexPreview(null);
      setLabelPreview(null);
    }
  };
  const onDelete = () => {
    const index = indexPreview ? indexPreview : props.index;
    props.onIndexDeleted(index);
    setIndexPreview(null);
  };
  const onCancel = (_event: any) => {
    setIndexPreview(null);
  };

  // Navigation top panel UI callbacks
  const onNext = (_event: any) => {
    props.onNextClick();
    setIndexPreview(null);
    setLabelPreview(null);
  };
  const onBack = (_event: any) => {
    props.onBackClick();
    setIndexPreview(null);
    setLabelPreview(null);
  };

  // General controls side panel UI callbacks
  const onSave = (_event: any) => {
    props.onSaveClick();
  };

  // Clear the state
  const onClearClick = (_event: any) => {
    props.onClearClick();
    setIndexPreview(null);
    setLabelPreview(null);
  };

  // Receive uploaded input file
  const handleFile = (file: InputFile) => {
    props.onFileUploaded(file);
    setIndexPreview(null);
    setLabelPreview(null);
  };

  // Calculate total progress
  let completed: number = 0;
  let progress: number = 0;
  if (props.samples.length !== 0) {
    const filtered = props.samples.filter((sample) => {
      return sample.labels.length !== 0;
    });

    completed = filtered.length;
    progress = (completed + 1) / props.samples.length;
    progress *= 100;
  }

  // Prepare metadata timestamp
  let timestamp: number | null = null;
  if (props.metadata) {
    timestamp = props.metadata.timestamp;
  }

  // Filter records by completeness state
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);
  const [onlyFinished, setOnlyFinished] = useState(false);

  const onUnfinishedFilterApply = (_event: any) => {
    const isSelected = !onlyUnfinished;
    const filter = isSelected ? FilterState.ONLY_UNFINISHED : FilterState.ALL;
    setOnlyUnfinished(isSelected);
    setOnlyFinished(false);
    setIndexPreview(null);
    props.onFilterApply(filter);
  };

  const onFinishedFilterApply = (_event: any) => {
    const isSelected = !onlyFinished;
    const filter = isSelected ? FilterState.ONLY_FINISHED : FilterState.ALL;
    setOnlyFinished(isSelected);
    setOnlyUnfinished(false);
    setIndexPreview(null);
    props.onFilterApply(filter);
  };

  // Disable flag for functional components
  const isContentEmpty = props.samples.length === 0;

  return (
    <div>
      <div className={styles.sidePanel}>
        <div>
          <div className={styles.generalControls}>
            <ButtonGroup width="100%" display="flex">
              <FileUploader width="33%" handleFile={handleFile}>
                <b>New</b>
              </FileUploader>
              <Button width="33%" onClick={onSave} disabled={isContentEmpty}>
                💾
              </Button>
              <DeleteButton
                width="33%"
                handleAccept={onClearClick}
                disabled={isContentEmpty}
              >
                🗑
              </DeleteButton>
            </ButtonGroup>
          </div>
          <div className={styles.generalMetaInfo}>
            <Text>Last updated</Text>
            <div>
              <Time timestamp={timestamp} />
            </div>
          </div>
        </div>
        <div>
          <div>
            <h2>Progress</h2>
            <div>
              <Number value={completed} />
              {" of "}
              <Number value={props.samples.length} />
            </div>
          </div>
          <div className={styles.progressBar}>
            <ProgressBar progress={progress} inline width="100%" />
          </div>
        </div>
        <div className={styles.itemsContainer}>
          <div>
            <h2>Items</h2>
          </div>
          <div className={styles.itemsComponent}>
            <Fragment>
              <Select
                instanceId="react-select-item"
                className="basic-single"
                classNamePrefix="select"
                isClearable={false}
                isSearchable={true}
                name="item"
                value={navigationItem}
                options={navigationItems}
                onChange={onNavigationChange}
                isDisabled={isContentEmpty}
                filterOption={createFilter({ ignoreAccents: false })}
              />
            </Fragment>
            <Box my={1}>
              <label>
                <input
                  type="checkbox"
                  checked={onlyUnfinished}
                  onChange={onUnfinishedFilterApply}
                  className={styles.checkbox}
                />
                <label className={styles.checkboxLabel}>Only unfinished</label>
              </label>
            </Box>
            <Box my={1}>
              <label>
                <input
                  type="checkbox"
                  checked={onlyFinished}
                  onChange={onFinishedFilterApply}
                  className={styles.checkbox}
                />
                <label className={styles.checkboxLabel}>Only finished</label>
              </label>
            </Box>
          </div>
          <div className={styles.itemsComponent}>
            <div className={styles.itemsControlPanel}>
              <ButtonGroup width="100%" display="flex">
                <DeleteButton
                  width="50%"
                  handleAccept={onDelete}
                  disabled={isContentEmpty}
                >
                  Delete
                </DeleteButton>
                <Button
                  width="50%"
                  onClick={onCancel}
                  disabled={indexPreview == null}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </div>
          </div>
          <div className={styles.itemsComponent}>
            <ButtonPrimary
              width="100%"
              onClick={onConfirm}
              disabled={indexPreview == null}
            >
              Confirm
            </ButtonPrimary>
          </div>
        </div>
      </div>
      <nav className={styles.topPanel}>
        <div className={styles.topPanelComponents}>
          <div className={styles.topPanelComponentsTitle}>
            <h1>🦄 Studio</h1>
          </div>
          <div className={styles.selectBox}>
            <Fragment>
              <Select
                instanceId="react-select-label"
                className="basic-single"
                classNamePrefix="select"
                isClearable={true}
                isSearchable={false}
                name="label"
                value={labelItem}
                options={props.labelOptions}
                onChange={onLabelChange}
                isDisabled={isContentEmpty}
                filterOption={createFilter({ ignoreAccents: false })}
              />
            </Fragment>
          </div>
          <div className={styles.topPanelComponentsItem}>
            <ButtonPrimary onClick={onNext} disabled={isContentEmpty}>
              Next
            </ButtonPrimary>
          </div>
          <div className={styles.topPanelComponentsItem}>
            <Button onClick={onBack} disabled={isContentEmpty}>
              Back
            </Button>
          </div>
        </div>
      </nav>
      <div className={styles.container}>
        <main>{props.children}</main>
      </div>
    </div>
  );
};

export default StudioContainer;
