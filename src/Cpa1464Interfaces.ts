export interface ICpa1464Element {
  name: string;
  data: string;
  maxLength: number;
  padChar: string;
  format(): string;
  parse(name: string, formattedData: string, maxLength: number, padChar: string): any;
}

export interface ICpa1464RecordMapAtomic {
  name: string;
  type: string;
  offset: number;
  length: number;
}

export interface ICpa1464RecordMap {
  header: ICpa1464RecordMapAtomic[];
  segment: ICpa1464RecordMapAtomic[];
  recordType: string;
  segmentCount: number;
  segmentLength: number;
}

export interface ICpa1464Record {
  map: ICpa1464RecordMap;
  data: string;
  formatElement(name: string, data: any, segment: number): any;
  parseElement(name: string, segment: number): any;
}

export interface ICpa1464File {
  records: ICpa1464Record[];
  file: string;
  recordMappings: any;
  formatRecords(data: any): any;
  parseRecords(): any;
  generateFile(): any;
  getFile(): string;
}
