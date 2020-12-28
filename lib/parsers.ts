import camelcaseKeys from "camelcase-keys";
import { InputData, InputFile, Metadata, Sample } from "../components/types";

interface IDataParser {
  parse: (inputFile: InputFile) => Promise<InputData>;
}

const isMetadata = (obj: any) => {
  return "type" in obj && obj.type == "metadata";
};

export class DataParser implements IDataParser {
  parse = (inputFile: InputFile) => {
    let samples: Promise<InputData>;
    if (inputFile) {
      samples = inputFile.text().then((text) => {
        let _samples: Sample[] = [];
        let _metadata: Metadata | undefined;

        text.split("\n").forEach((line) => {
          // Filter empty lines
          if (!line) return null;

          // Convert underscore keys into camelcased
          const item = camelcaseKeys(JSON.parse(line), { deep: true });

          // Put metadata object away
          if (isMetadata(item)) {
            _metadata = item as Metadata;
          } else {
            _samples.push(item as Sample);
          }
        });

        return { samples: _samples, metadata: _metadata };
      });
    } else {
      samples = Promise.resolve({ samples: [] });
    }

    return samples;
  };
}
