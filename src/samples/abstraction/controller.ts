import { Cpa1464File } from '../../Cpa1464File';
import {
  ICpa1464ControllerConfig,
  ICpa1464ControllerTransaction,
  ICpa1464Controller,
  ICpa1464ControllerMeta,
} from './interfaces';
import moment from 'moment';

export class Cpa1464Controller implements ICpa1464Controller {
  static fileCreationNumber: number = 1;
  private dateToJulian(date: string) {
    return `0${moment(date, 'YYYY-MM-DD').format('YYDDD')}`;
  }
  private julianToDate(julianDate: string) {
    return moment(julianDate.substr(-5), 'YYDDD').format('YYYY-MM-DD');
  }
  private createHeaderRecord(config: ICpa1464ControllerConfig, recordMeta: ICpa1464ControllerMeta) {
    const header: any = {
      logicalRecordTypeId: 'A',
      logicalRecordCount: recordMeta.logicalRecordCount.toString(),
      originatorsId: `${config.dataCentre}${config.eftId}`,
      fileCreationNo: Cpa1464Controller.fileCreationNumber.toString(),
    };
    const segments: any = [
      {
        creationDate: this.dateToJulian(moment().format('YYYY-MM-DD')),
        destinationDataCentre: config.dataCentre,
        reservedCustomerDirectClearerCommunication: config.directClearer,
        currencyCodeIdentifier: config.currencyCode,
        filler: '',
      },
    ];
    recordMeta.logicalRecordCount += 1;
    return {
      header,
      segments,
    };
  }
  private createFooterRecord(config: ICpa1464ControllerConfig, recordMeta: ICpa1464ControllerMeta) {
    const header: any = {
      logicalRecordTypeId: 'Z',
      logicalRecordCount: recordMeta.logicalRecordCount.toString(),
      originatorsId: `${config.dataCentre}${config.eftId}`,
      fileCreationNo: Cpa1464Controller.fileCreationNumber.toString(),
    };
    const segments: any = [
      {
        totalValueDebitTransactions: recordMeta.totalValueDebitTransactions.toString(),
        totalNumberDebitTransactions: recordMeta.totalNumberDebitTransactions.toString(),
        totalValueCreditTransactions: recordMeta.totalValueCreditTransactions.toString(),
        totalNumberCreditTransactions: recordMeta.totalNumberCreditTransactions.toString(),
        totalValueErrorCorrectionsE: recordMeta.totalValueErrorCorrectionsE.toString(),
        totalNumberErrorCorrectionsE: recordMeta.totalNumberErrorCorrectionsE.toString(),
        totalValueErrorCorrectionsF: recordMeta.totalValueErrorCorrectionsF.toString(),
        totalNumberErrorCorrectionsF: recordMeta.totalNumberErrorCorrectionsF.toString(),
        filler: '',
      },
    ];
    recordMeta.logicalRecordCount += 1;
    return {
      header,
      segments,
    };
  }
  private createCRecords(
    config: ICpa1464ControllerConfig,
    transactions: ICpa1464ControllerTransaction[],
    recordMeta: ICpa1464ControllerMeta
  ) {
    const cRecords: any = [];
    let segments: any = [];
    const pushRecord = () => {
      const header: any = {
        logicalRecordTypeId: 'C',
        logicalRecordCount: recordMeta.logicalRecordCount.toString(),
        originatorsId: `${config.dataCentre}${config.eftId}`,
        fileCreationNo: Cpa1464Controller.fileCreationNumber.toString(),
      };
      cRecords.push({
        header,
        segments,
      });
      recordMeta.logicalRecordCount += 1;
      segments = [];
    };
    transactions.forEach((transaction: ICpa1464ControllerTransaction) => {
      const segment: any = {
        transactionType: '450',
        amount: transaction.amount,
        dateFundsToBeAvailable: transaction.date
          ? this.dateToJulian(transaction.date)
          : this.dateToJulian(moment().format('YYYY-MM-DD')),
        institutionalIdentificationNo: `${transaction.bankId}${transaction.transitNumber}`,
        payeeAccountNo: `${transaction.accountNumber}`,
        itemTraceNo: `${transaction.returnBankId}9${
          config.dataCentre
        }${Cpa1464Controller.fileCreationNumber.toString().padStart(4, '0')}${config.eftId}0000`,
        storedTransactionType: '0',
        originatorsShortName: `${transaction.shortName}`,
        payeeName: `${transaction.customerName}`,
        originatorsLongName: `${transaction.longName}`,
        originatingDirectClearersUsersId: '',
        originatorsCrossReferenceNo: `${transaction.crossReferenceNumber}`,
        institutionalIdNoForReturns: `${transaction.returnBankId}${transaction.returnTransitNumber}`,
        accountNoForReturns: `${transaction.returnAccountNumber}`,
        originatorsSundryInformation: `${transaction.sundryInfo}`,
        filler: '',
        originatorDirectClearerSettlementCode: '',
        invalidDataElementId: '0',
      };
      recordMeta.totalNumberCreditTransactions += 1;
      recordMeta.totalValueCreditTransactions += parseInt(transaction.amount, 10);
      segments.push(segment);

      if (segments.length === 6) {
        pushRecord();
      }
    });
    if (segments.length > 0) {
      pushRecord();
    }

    return cRecords;
  }
  public formatFile(config: ICpa1464ControllerConfig, transactions: ICpa1464ControllerTransaction[]) {
    const recordMeta: ICpa1464ControllerMeta = {
      logicalRecordCount: 1,
      totalValueDebitTransactions: 0,
      totalNumberDebitTransactions: 0,
      totalValueCreditTransactions: 0,
      totalNumberCreditTransactions: 0,
      totalValueErrorCorrectionsE: 0,
      totalNumberErrorCorrectionsE: 0,
      totalValueErrorCorrectionsF: 0,
      totalNumberErrorCorrectionsF: 0,
    };

    if (config.fileCreationNumber && config.fileCreationNumber.length > 0) {
      Cpa1464Controller.fileCreationNumber = parseInt(config.fileCreationNumber, 10);
    }

    let records: any = [];
    records.push(this.createHeaderRecord(config, recordMeta));
    records = records.concat(this.createCRecords(config, transactions, recordMeta));
    records.push(this.createFooterRecord(config, recordMeta));

    Cpa1464Controller.fileCreationNumber += 1;
    if (Cpa1464Controller.fileCreationNumber >= 1000) {
      Cpa1464Controller.fileCreationNumber = 0;
    }

    const cpa1464 = new Cpa1464File();
    cpa1464.formatRecords(records);
    cpa1464.generateFile();
    return cpa1464.getFile();
  }
  public parseFile(file: string) {
    const cpa1464 = new Cpa1464File(file);
    const config: any = {};
    const transactions: ICpa1464ControllerTransaction[] = [];
    const totals: any = {};
    cpa1464.parseRecords().forEach((record: any) => {
      switch (record.header.logicalRecordTypeId) {
        case 'A':
          config.eftId = record.header.originatorsId.substr(5, 5);
          config.fileCreationNumber = record.header.fileCreationNo;
          config.dataCentre = record.segments[0].destinationDataCentre;
          config.currencyCode = record.segments[0].currencyCodeIdentifier;
          config.directClearer = record.segments[0].reservedCustomerDirectClearerCommunication;
          config.fileCreationDate = this.julianToDate(record.segments[0].creationDate);
          break;
        case 'C':
          record.segments.forEach((segment: any) => {
            if (segment.payeeAccountNo.length > 0) {
              transactions.push({
                type: 'CREDIT',
                date: this.julianToDate(segment.dateFundsToBeAvailable),
                amount: segment.amount,
                bankId: segment.institutionalIdentificationNo.substr(1, 3),
                transitNumber: segment.institutionalIdentificationNo.substr(4, 5),
                accountNumber: segment.payeeAccountNo,
                customerName: segment.payeeName,
                returnBankId: segment.institutionalIdNoForReturns.substr(1, 3),
                returnTransitNumber: segment.institutionalIdNoForReturns.substr(4, 5),
                returnAccountNumber: segment.accountNoForReturns,
                shortName: segment.originatorsShortName,
                longName: segment.originatorsLongName,
                sundryInfo: segment.originatorsSundryInformation,
                crossReferenceNumber: segment.originatorsCrossReferenceNo,
              });
            }
          });
          break;
        case 'Z':
          totals.totalValueCreditTransactions = record.segments[0].totalValueCreditTransactions;
          totals.totalNumberCreditTransactions = record.segments[0].totalNumberCreditTransactions;
          break;
        default:
          break;
      }
    });
    return {
      config,
      transactions,
      totals,
    };
  }
}
