import { ICpa1464Element } from './Cpa1464Interfaces';

export class Cpa1464Element implements ICpa1464Element {
  name: string = '';
  data: string;
  maxLength: number = 0;
  padChar: string = '';
  constructor(name?: string, data?: string, maxLength?: number, padChar?: string) {
    this.name = name;
    this.data = data;
    this.maxLength = maxLength;
    this.padChar = padChar;
  }
  public format() {
    return this.data.toString();
  }
  public parse(name: string, formattedData: string, maxLength: number, padChar: string) {
    this.name = name;
    this.data = formattedData.trim();
    this.maxLength = maxLength;
    this.padChar = padChar;
  }
}

export class Cpa1464Alphanumeric extends Cpa1464Element implements ICpa1464Element {
  constructor(name?: string, data?: string, maxLength?: number) {
    super(name, data, maxLength, ' ');
    if (name && data) {
      this.checkType(name, data);
    }
  }
  private checkType(name: string, data: string) {
    if (data.length > 0 && !data.match(/^[0-9a-zA-Z ]+$/)) {
      throw new Error(`Alphanumeric data element ${name} contains non-alphanumeric characters which is not allowed`);
    }
  }
  public format() {
    this.checkType(this.name, this.data);
    return this.data.toString().padEnd(this.maxLength, this.padChar);
  }
  public parse(name: string, formattedData: string, maxLength: number) {
    this.checkType(name, formattedData);
    super.parse(name, formattedData, maxLength, ' ');
  }
}

export class Cpa1464Numeric extends Cpa1464Element implements ICpa1464Element {
  constructor(name?: string, data?: string, maxLength?: number) {
    super(name, data, maxLength, '0');
    if (name && data) {
      this.checkType(name, data);
    }
  }
  private checkType(name: string, data: string) {
    if (data.length > 0 && !data.match(/^[0-9 ]+$/)) {
      throw new Error(`Numeric data element '${name}' contains alphabetical characters which is not allowed`);
    }
  }
  public format() {
    this.checkType(this.name, this.data);
    return this.data.toString().padStart(this.maxLength, this.padChar);
  }
  public parse(name: string, formattedData: string, maxLength: number) {
    this.checkType(name, formattedData);
    super.parse(name, formattedData, maxLength, '0');
  }
}
