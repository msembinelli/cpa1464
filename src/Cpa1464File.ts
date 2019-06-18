import { ICpa1464File, ICpa1464RecordMap } from './Cpa1464Interfaces';
import { Cpa1464Record } from './Cpa1464Record';
const glob = require('glob');
const path = require('path');

export default class Cpa1464File implements ICpa1464File {
  records: Cpa1464Record[];
  file: string;
  recordMappings: any = {};
  constructor(file?: string, externalMaps?: ICpa1464RecordMap[]) {
    this.file = file;
    glob.sync('./src/lib/maps/*.json').forEach((file: any) => {
      const importedFile = require(path.resolve(file));
      this.recordMappings[importedFile.recordType] = importedFile;
    });
    if (externalMaps) {
      externalMaps.forEach((map: any) => {
        this.recordMappings[map.recordType] = map;
      });
    }
  }
  private getRecordMap = (recordString: string): ICpa1464RecordMap => {
    if (recordString[0] in this.recordMappings) {
      return this.recordMappings[recordString[0]];
    }
    throw new Error(`CPA1464 record type ${recordString[0]} not implemented`);
  };
  public formatRecords = (recordsRaw: any) => {
    this.records = recordsRaw.map((element: any) => {
      return new Cpa1464Record(this.getRecordMap(element.header.logicalRecordTypeId));
    });

    recordsRaw.forEach((recordRaw: any, i: number) => {
      Object.keys(recordRaw.header).forEach((headerField) => {
        this.records[i].formatElement(headerField, recordRaw.header[headerField]);
      });
      recordRaw.segments.forEach((segmentRaw: any, j: number) => {
        Object.keys(segmentRaw).forEach((segmentField) => {
          this.records[i].formatElement(segmentField, segmentRaw[segmentField], j);
        });
      });
    });
  };
  public parseRecords = () => {
    const recordStrings = this.file.trim().split('\n');
    this.records = recordStrings.map((recordString) => {
      return new Cpa1464Record(this.getRecordMap(recordString), recordString);
    });

    const recordsParsed: any = [];
    this.records.forEach((record) => {
      const header: any = {};
      const segments: any = [];
      record.map.header.forEach((element) => {
        header[element.name] = record.parseElement(element.name);
      });
      for (let i = 0; i < record.map.segmentCount; i += 1) {
        const segment: any = {};
        record.map.segment.forEach((element) => {
          segment[element.name] = record.parseElement(element.name, i);
        });
        segments.push(segment);
      }
      recordsParsed.push({
        header,
        segments,
      });
    });
    return recordsParsed;
  };
  public generateFile = () => {
    this.file = this.records
      .map((record) => {
        return record.data;
      })
      .join('\n');
  };
  public getFile = () => {
    return `${this.file}\n`;
  };
}
