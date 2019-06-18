import { ICpa1464Record, ICpa1464RecordMap, ICpa1464RecordMapAtomic } from './Cpa1464Interfaces';
import { Cpa1464Alphanumeric, Cpa1464Numeric } from './Cpa1464Element';

export class Cpa1464Record implements ICpa1464Record {
  map: ICpa1464RecordMap;
  data: string;
  elementMap: any = {
    alphanumeric: Cpa1464Alphanumeric,
    numeric: Cpa1464Numeric,
  };
  maxRecordSize = 1464;
  constructor(map: ICpa1464RecordMap, data?: string) {
    this.map = map;
    if (!data) {
      this.data = ' '.repeat(this.maxRecordSize);
      this.initializeRecord();
    } else {
      this.data = data;
    }
  }
  private initializeRecord() {
    this.map.header.forEach((headerElement) => {
      this.formatElement(headerElement.name, '');
    });
    for (let i = 0; i < this.map.segmentCount; i += 1) {
      this.map.segment.forEach((segmentElement) => {
        this.formatElement(segmentElement.name, '', i);
      });
    }
  }
  private writeData = (replacement: string, index: number) => {
    return this.data.substr(0, index - 1) + replacement + this.data.substr(index - 1 + replacement.length);
  };
  private readData = (index: number, length: number) => {
    return this.data.substr(index - 1, length);
  };
  private selectMapAtomic = (name: string) => {
    const fullMap: ICpa1464RecordMapAtomic[] = this.map.header.concat(this.map.segment);
    const [selectedMapAtomic] = fullMap.filter((element) => {
      return element.name.toLowerCase() === name.toLowerCase();
    });
    return selectedMapAtomic;
  };
  private getElementClass = (type: string) => {
    if (type.toLowerCase() in this.elementMap) {
      return this.elementMap[type.toLowerCase()];
    }
    throw new Error(`CPA1464 element type ${type.toLowerCase()} not implemented`);
  };
  public formatElement = (name: string, data: string, segment: number = 0) => {
    const selectedMapAtomic = this.selectMapAtomic(name);

    if (!selectedMapAtomic) {
      throw new Error(`Data element ${name} not found in CPA1464 mapping`);
    }
    if (data.length > selectedMapAtomic.length) {
      throw new Error(
        `Data element larger than CPA1464 record map specification. Got length ${data.length} for ${name}`
      );
    }
    if (selectedMapAtomic.offset + segment * this.map.segmentLength + data.length > this.maxRecordSize + 1) {
      throw new Error('Data element exceeds the max size of a CPA1464 record');
    }
    if (segment + 1 > this.map.segmentCount) {
      throw new Error('Max segment count exceeded');
    }

    const cpa1464ElementClass: any = this.getElementClass(selectedMapAtomic.type);
    const fieldObj: typeof cpa1464ElementClass = new cpa1464ElementClass(name, data, selectedMapAtomic.length);
    this.data = this.writeData(fieldObj.format(), selectedMapAtomic.offset + segment * this.map.segmentLength);
  };
  public parseElement = (name: string, segment: number = 0) => {
    const selectedMapAtomic = this.selectMapAtomic(name);

    if (!selectedMapAtomic) {
      throw new Error(`Data element ${name} not found in CPA1464 record map`);
    }
    if (segment + 1 > this.map.segmentCount) {
      throw new Error('Max segment count exceeded');
    }

    const cpa1464ElementClass: any = this.getElementClass(selectedMapAtomic.type);
    const fieldObj: typeof cpa1464ElementClass = new cpa1464ElementClass();
    fieldObj.parse(
      name,
      this.readData(selectedMapAtomic.offset + segment * this.map.segmentLength, selectedMapAtomic.length),
      selectedMapAtomic.length
    );
    return fieldObj.data;
  };
}
