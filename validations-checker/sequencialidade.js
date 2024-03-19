/* * */

const fs = require('fs');
require('dotenv').config();
const REALTIMEDB = require('./REALTIMEDB');
const Papa = require('papaparse');
/* * */

/* * *
 * ONE TIME EXECUTION
 */
(async () => {
  console.log();
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  const start = new Date();
  console.log('> Started on ' + start.toISOString());

  /* * * * * * * * * * * * */

  await REALTIMEDB.connect();

  /* * */

  const newLineCharacter = '\n';

  /* * */

  const operatorId = '42';
  const samSerialNumber = '2932060902';
  const startDate = '2024-01-01T04:00:00';
  const endDate = '2024-01-13T03:59:59';

  /* * */

  const salesBetweenDates = {
    'transaction.operatorLongID': operatorId,
    'transaction.transactionDate': { $gte: startDate, $lte: endDate },
    'transaction.macDataFields.samSerialNumber': samSerialNumber,
  };

  const validationsBetweenDates = {
    'transaction.operatorLongID': operatorId,
    'transaction.transactionDate': { $gte: startDate, $lte: endDate },
    'transaction.macDataFields.samSerialNumber': samSerialNumber,
  };

  const locationsBetweenDates = {
    'transaction.operatorLongID': operatorId,
    'transaction.transactionDate': { $gte: startDate, $lte: endDate },
    'transaction.macDataFields.samSerialNumber': samSerialNumber,
  };

  /* * */

  const salesStream = REALTIMEDB.SalesEntity.find(salesBetweenDates, { allowDiskUse: true, maxTimeMS: 180000 }).stream();
  const validationsStream = REALTIMEDB.ValidationEntity.find(validationsBetweenDates, { allowDiskUse: true, maxTimeMS: 180000 }).stream();
  const locationsStream = REALTIMEDB.LocationEntity.find(locationsBetweenDates, { allowDiskUse: true, maxTimeMS: 180000 }).stream();

  //

  let salesCounter = 0;
  let validationsCounter = 0;
  let locationsCounter = 0;

  //

  let isFirstDoc = true;

  //

  for await (const doc of salesStream) {
    //

    salesCounter++;

    // Log progress
    console.log(`> Found matching <sales> transaction | counter: ${salesCounter} | _id: ${doc._id} | tx_id: ${doc.transaction.transactionId} | apex_version: ${doc.transaction.apexVersion}`);

    // Parse the data
    let csvData = Papa.unparse(
      [
        {
          _id: doc._id,
          type: 'sales',
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

    fs.appendFileSync(`sequencialidade.csv`, isFirstDoc ? csvData : newLineCharacter + csvData);

    if (isFirstDoc) isFirstDoc = false;

    //
  }

  //

  for await (const doc of validationsStream) {
    //

    validationsCounter++;

    // Log progress
    console.log(`> Found matching <validations> transaction | counter: ${validationsCounter} | _id: ${doc._id} | tx_id: ${doc.transaction.transactionId} | apex_version: ${doc.transaction.apexVersion}`);

    // Parse the data
    let csvData = Papa.unparse(
      [
        {
          _id: doc._id,
          type: 'validations',
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

    fs.appendFileSync(`sequencialidade.csv`, isFirstDoc ? csvData : newLineCharacter + csvData);

    if (isFirstDoc) isFirstDoc = false;

    //
  }

  //

  for await (const doc of locationsStream) {
    //

    locationsCounter++;

    // Log progress
    console.log(`> Found matching <locations> transaction | counter: ${locationsCounter} | _id: ${doc._id} | tx_id: ${doc.transaction.transactionId} | apex_version: ${doc.transaction.apexVersion}`);

    // Parse the data
    let csvData = Papa.unparse(
      [
        {
          _id: doc._id,
          type: 'locations',
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

    fs.appendFileSync(`sequencialidade.csv`, isFirstDoc ? csvData : newLineCharacter + csvData);

    if (isFirstDoc) isFirstDoc = false;

    //
  }

  //
})();
