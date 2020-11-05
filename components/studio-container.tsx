import {
  Button,
  ButtonDanger,
  ButtonPrimary,
  ProgressBar,
  Text,
} from "@primer/components";
import { Fragment } from "react";
import NumberFormat from "react-number-format";
import Select, { OptionsType } from "react-select";
import styles from "./studio-container.module.css";
import Time from "./date";

export default function StudioContainer({
  children,
  selectOptions,
}: {
  children?: React.ReactNode;
  selectOptions: OptionsType<{ value: string; label: string }>;
}) {
  const range = Array.from(Array(100).keys());
  const items = range.map((item) => {
    return {
      value: `val_${item}`,
      label: `🚫 value #${item}`,
    };
  });

  return (
    <div>
      <div className={styles.sidePanel}>
        <div>
          <div className={styles.generalControls}>
            <div className={styles.generalControlsItem}>
              <Button>New Session</Button>
            </div>
            <div className={styles.generalControlsItem}>
              <Button>💾</Button>
            </div>
          </div>
          <div className={styles.generalMetaInfo}>
            <Text>Last updated</Text>
            <div>
              <Time timestamp={1604543330537} />
            </div>
          </div>
        </div>
        <div>
          <div>
            <h2>Progress</h2>
            <div>
              <Text mr={3}>
                <b>Total: </b>
                <NumberFormat
                  value={10000}
                  displayType={"text"}
                  thousandSeparator={true}
                />
              </Text>
            </div>
            <div>
              <Text mr={3}>
                <b>Accepted: </b>
                <NumberFormat
                  value={5000}
                  displayType={"text"}
                  thousandSeparator={true}
                />
              </Text>
            </div>
          </div>
          <div className={styles.progressBar}>
            <ProgressBar progress={50} inline width="100%" />
          </div>
        </div>
        <div className={styles.itemsContainer}>
          <div>
            <h2>Items</h2>
          </div>
          <div className={styles.itemsComponent}>
            <Fragment>
              <Select
                className="basic-single"
                classNamePrefix="select"
                isClearable={true}
                isSearchable={true}
                name="item"
                options={items}
              />
            </Fragment>
          </div>
          <div className={styles.itemsComponent}>
            <div className={styles.itemsControlPanel}>
              <ButtonPrimary>Confirm</ButtonPrimary>
              <Button>Cancel</Button>
            </div>
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
                className="basic-single"
                classNamePrefix="select"
                isClearable={true}
                isSearchable={false}
                name="label"
                options={selectOptions}
              />
            </Fragment>
          </div>
          <div className={styles.topPanelComponentsItem}>
            <ButtonPrimary>Accept</ButtonPrimary>
          </div>
          <div className={styles.topPanelComponentsItem}>
            <ButtonDanger>Reject</ButtonDanger>
          </div>
          <div className={styles.topPanelComponentsItem}>
            <Button>Skip</Button>
          </div>
        </div>
      </nav>
      <div className={styles.container}>
        <main>{children}</main>
      </div>
    </div>
  );
}
