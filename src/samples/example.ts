import Cpa1464File from '../Cpa1464File';
const fs = require('fs');
const records = require('./records.json');

// Format JSON to cpa file
const cpaFile1 = new Cpa1464File();
cpaFile1.formatRecords(records);
cpaFile1.generateFile();

// tslint:disable no-console
fs.writeFile('file.cpa1464', cpaFile1.getFile(), (err: any) => {
  if (err) console.log(err);
  console.log('Successfully Written to File.');
});

// Parse existing cpa file
const cpaFile2 = new Cpa1464File(cpaFile1.getFile());

fs.writeFile('records.json', JSON.stringify(cpaFile2.parseRecords()), (err: any) => {
  if (err) console.log(err);
  console.log('Successfully Written to File.');
});
// tslint:enable no-console
