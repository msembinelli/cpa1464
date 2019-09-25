# cpa1464

Node package for creating cpa1464 standard files from JSON objects https://www.payments.ca/sites/default/files/standard-005.pdf

## Installation

`npm install --save cpa1464` or `yarn add cpa1464`

## Example

The controller provided in `samples/abstraction` is an example of how we can abstract away some of the finer details of cpa1464. Feel free to build your own controller or use the one provided.
NOTE: the default controller only provides support for A, C, Z records.

```ts
import fs from 'fs';
import { Cpa1464Controller } from './src/samples/abstraction/controller';
import { ICpa1464ControllerConfig, ICpa1464ControllerTransaction } from './src/samples/abstraction/interfaces';

const configCpa1464: ICpa1464ControllerConfig = {
  eftId: '55555',
  dataCentre: '99999',
  directClearer: 'SOME TREASURY',
  currencyCode: 'CAD',
};

const transactionsCpa1464: ICpa1464ControllerTransaction[] = [
  {
    type: 'CREDIT',
    amount: '1000',
    bankId: '001',
    transitNumber: '02222',
    accountNumber: '998877665',
    customerName: 'TEST PAYEE',
    returnBankId: '219',
    returnTransitNumber: '01111',
    returnAccountNumber: '11223344',
    shortName: 'TEST',
    longName: 'TEST LONG',
    sundryInfo: 'Sundry Info',
    crossReferenceNumber: '1234567890',
  },
  {
    type: 'CREDIT',
    amount: '1001',
    bankId: '001',
    transitNumber: '02222',
    accountNumber: '998877665',
    customerName: 'TEST PAYEE',
    returnBankId: '219',
    returnTransitNumber: '01111',
    returnAccountNumber: '11223344',
    shortName: 'TEST',
    longName: 'TEST LONG',
    sundryInfo: 'Sundry Info',
    crossReferenceNumber: '1234567890',
  },
  {
    type: 'CREDIT',
    amount: '1002',
    bankId: '001',
    transitNumber: '02222',
    accountNumber: '998877665',
    customerName: 'TEST PAYEE',
    returnBankId: '219',
    returnTransitNumber: '01111',
    returnAccountNumber: '11223344',
    shortName: 'TEST',
    longName: 'TEST LONG',
    sundryInfo: 'Sundry Info',
    crossReferenceNumber: '1234567890',
  },
  {
    type: 'CREDIT',
    amount: '1003',
    bankId: '001',
    transitNumber: '02222',
    accountNumber: '998877665',
    customerName: 'TEST PAYEE',
    returnBankId: '219',
    returnTransitNumber: '01111',
    returnAccountNumber: '11223344',
    shortName: 'TEST',
    longName: 'TEST LONG',
    sundryInfo: 'Sundry Info',
    crossReferenceNumber: '1234567890',
  },
  {
    type: 'CREDIT',
    amount: '1004',
    bankId: '001',
    transitNumber: '02222',
    accountNumber: '998877665',
    customerName: 'TEST PAYEE',
    returnBankId: '219',
    returnTransitNumber: '01111',
    returnAccountNumber: '11223344',
    shortName: 'TEST',
    longName: 'TEST LONG',
    sundryInfo: 'Sundry Info',
    crossReferenceNumber: '1234567890',
  },
  {
    type: 'CREDIT',
    amount: '1005',
    bankId: '001',
    transitNumber: '02222',
    accountNumber: '998877665',
    customerName: 'TEST PAYEE',
    returnBankId: '219',
    returnTransitNumber: '01111',
    returnAccountNumber: '11223344',
    shortName: 'TEST',
    longName: 'TEST LONG',
    sundryInfo: 'Sundry Info',
    crossReferenceNumber: '1234567890',
  },
  {
    type: 'CREDIT',
    amount: '1006',
    bankId: '001',
    transitNumber: '02222',
    accountNumber: '998877665',
    customerName: 'TEST PAYEE',
    returnBankId: '219',
    returnTransitNumber: '01111',
    returnAccountNumber: '11223344',
    shortName: 'TEST',
    longName: 'TEST LONG',
    sundryInfo: 'Sundry Info',
    crossReferenceNumber: '1234567890',
  },
  {
    type: 'CREDIT',
    amount: '1007',
    bankId: '001',
    transitNumber: '02222',
    accountNumber: '998877665',
    customerName: 'TEST PAYEE',
    returnBankId: '219',
    returnTransitNumber: '01111',
    returnAccountNumber: '11223344',
    shortName: 'TEST',
    longName: 'TEST LONG',
    sundryInfo: 'Sundry Info',
    crossReferenceNumber: '1234567890',
  },
];

const controller = new Cpa1464Controller();
const file = controller.formatFile(configCpa1464, transactionsCpa1464);
// tslint:disable no-console
fs.writeFile('test', file, (err: any) => {
  if (err) console.log(err);
  console.log('Successfully Written to File.');
});

fs.writeFile('test.json', JSON.stringify(controller.parseFile(file)), (err: any) => {
  if (err) console.log(err);
  console.log('Successfully Written to File.');
});
// tslint:enable no-console
```
