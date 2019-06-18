export interface ICpa1464ControllerConfig {
  eftId: string;
  dataCentre: string;
  directClearer: string;
  currencyCode: string;
  fileCreationNumber?: string;
  fileCreationDate?: string;
}

export interface ICpa1464ControllerTransaction {
  type: string;
  date?: string;
  amount: string;
  bankId: string;
  transitNumber: string;
  accountNumber: string;
  customerName: string;
  returnBankId: string;
  returnTransitNumber: string;
  returnAccountNumber: string;
  shortName: string;
  longName: string;
  sundryInfo: string;
  crossReferenceNumber: string;
}

export interface ICpa1464ControllerMeta {
  logicalRecordCount: number;
  totalValueDebitTransactions: number;
  totalNumberDebitTransactions: number;
  totalValueCreditTransactions: number;
  totalNumberCreditTransactions: number;
  totalValueErrorCorrectionsE: number;
  totalNumberErrorCorrectionsE: number;
  totalValueErrorCorrectionsF: number;
  totalNumberErrorCorrectionsF: number;
}

export interface ICpa1464Controller {
  fileCreationNumber: number;
  formatFile(config: ICpa1464ControllerConfig, transactions: ICpa1464ControllerTransaction[]): any;
  parseFile(file: string): any;
}
