/* * */

const fs = require('fs');
require('dotenv').config();
const REALTIMEDB = require('./REALTIMEDB');
const Papa = require('papaparse');

/* * */

(async () => {
  console.log();
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  const start = new Date();
  console.log('> Started on ' + start.toISOString());

  /* * * * * * * * * * * * */

  await REALTIMEDB.connect();

  console.log('searching...');

  /* * */

  const newLineCharacter = '\n';

  /* * */

  const operatorIds = ['41', '42', '43', '44'];
  const startDate = '2024-01-02T04:00:00';
  const endDate = '2024-01-03T03:59:59';

  const allowedApexValidationStatuses = [0, 4, 5, 6];

  /* * */

  const totalValidTransactions = {
    'transaction.operatorLongID': { $in: operatorIds },
    'transaction.transactionDate': { $gte: startDate, $lte: endDate },
    'transaction.validationStatus': { $in: allowedApexValidationStatuses },
  };

  /* * */

  const resultStream = REALTIMEDB.ValidationEntity.find(totalValidTransactions, { allowDiskUse: true, maxTimeMS: 180000 }).stream();

  //

  let resultCounter = 0;

  //

  let isFirstDoc = true;

  //

  for await (const doc of resultStream) {
    //

    resultCounter++;

    // Log progress
    console.log(`> Found matching transaction | counter: ${resultCounter} | _id: ${doc._id} | tx_id: ${doc.transaction.transactionId} | apex_version: ${doc.transaction.apexVersion}`);

    // Parse the data
    let csvData = Papa.unparse(
      [
        {
          _id: doc._id,
          transactionId: doc.transaction?.transactionId || 'N/A',
          transactionDate: doc.transaction?.transactionDate || 'N/A',
          samSerialNumber: doc.transaction.macDataFields?.samSerialNumber || 'N/A',
          aseCounterValue: doc.transaction.macDataFields?.aseCounterValue || 'N/A',
          stopLongID: doc.transaction.stopLongID || 'N/A',
        },
      ],
      {
        skipEmptyLines: 'greedy',
        newline: newLineCharacter,
        header: isFirstDoc,
      }
    );

    //

    fs.appendFileSync(`pax_${startDate}_${endDate}.csv`, isFirstDoc ? csvData : newLineCharacter + csvData);

    if (isFirstDoc) isFirstDoc = false;

    //
  }

  //
})();
