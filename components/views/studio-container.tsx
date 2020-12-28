import {
  Button,
  ButtonDanger,
  ButtonGroup,
  ButtonPrimary,
  ProgressBar,
  Text,
} from "@primer/components";
import { format } from "date-fns";
import React, { Fragment, useState } from "react";
import NumberFormat from "react-number-format";
import Select, { OptionsType } from "react-select";
import { Commit, InputFile, Metadata, Sample } from "../types";
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

interface Props {
  children?: React.ReactNode;
  labelOptions: OptionsType<Options>;

  onNextClick: () => void;
  onBackClick: () => void;
  onSaveClick: () => void;
  onIndexDeleted: (index: number | null) => void;
  onIndexSelected: (index: number | null) => void;
  onFileUploaded: (file: InputFile) => void;
  onLabelSelected: (label: string | null) => void;

  metadata?: Metadata;
  samples: Sample[];
  commits: Commit[];
  index: number | null;
  setIndex: (value: number | null) => void;
}

const StudioContainer: React.FC<Props> = (props) => {
  // Navigation items
  const navigationItems = props.commits.map((_commit, index) => {
    const sample = props.samples[index];
    const isCompleted = sample.labels.length !== 0;
    const prefix = isCompleted ? "✅" : "🚫";
    return {
      value: `${index}`,
      label: `${prefix} item #${index}`,
    };
  });

  // Update selected navigation preview item
  const [indexPreview, setIndexPreview] = useState<number | null>(null);
  const onNavigationChange = (option: OptionsType<Options> | any) => {
    if (option) {
      setIndexPreview(parseInt(option.value));
    }
  };

  // Selected navigation option
  let navigationItem: Options | null = null;
  if (indexPreview != null) {
    navigationItem = navigationItems[indexPreview];
  } else if (props.index != null) {
    navigationItem = navigationItems[props.index];
  }

  // Update selected label
  const [labelPreview, setLabelPreview] = useState<Options | null>(null);
  const onLabelChange = (option: OptionsType<Options> | any) => {
    if (option) {
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
    const labels = props.samples[props.index].labels;
    if (labels.length !== 0) {
      const matchingItems = props.labelOptions.filter(
        (option) => option.value === labels[0]
      );

      labelItem = matchingItems[0];
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
  const onDelete = (_event: any) => {
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

  // Receive uploaded input file
  const handleFile = (file: InputFile) => {
    props.onFileUploaded(file);
    setIndexPreview(null);
    setLabelPreview(null);
  };

  // Calculate total progress
  let completed: number = 0;
  let progress: number = 0;
  if (props.commits.length !== 0) {
    const filtered = props.samples.filter((sample) => {
      return sample.labels.length !== 0;
    });

    completed = filtered.length;
    progress = (completed + 1) / props.commits.length;
    progress *= 100;
  }

  // Prepare metadata timestamp
  let timestamp: number | null = null;
  if (props.metadata) {
    timestamp = props.metadata.timestamp;
  }

  return (
    <div>
      <div className={styles.sidePanel}>
        <div>
          <div className={styles.generalControls}>
            <div className={styles.generalControlsItem}>
              <FileUploader handleFile={handleFile}>New Session</FileUploader>
            </div>
            <div className={styles.generalControlsItem}>
              <Button onClick={onSave}>💾</Button>
            </div>
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
              <Number value={props.commits.length} />
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
              />
            </Fragment>
          </div>
          <div className={styles.itemsComponent}>
            <div className={styles.itemsControlPanel}>
              <ButtonGroup width="100%" display="flex">
                <ButtonDanger width="50%" onClick={onDelete}>
                  Delete
                </ButtonDanger>
                <Button width="50%" onClick={onCancel} disabled={!indexPreview}>
                  Cancel
                </Button>
              </ButtonGroup>
            </div>
          </div>
          <div className={styles.itemsComponent}>
            <ButtonPrimary
              width="100%"
              onClick={onConfirm}
              disabled={!indexPreview}
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
              />
            </Fragment>
          </div>
          <div className={styles.topPanelComponentsItem}>
            <ButtonPrimary onClick={onNext}>Next</ButtonPrimary>
          </div>
          <div className={styles.topPanelComponentsItem}>
            <Button onClick={onBack}>Back</Button>
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
