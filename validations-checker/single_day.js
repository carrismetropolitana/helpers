/* * */

const fs = require('fs');
require('dotenv').config();
const PCGIDB = require('./PCGIDB');
const Papa = require('papaparse');

/* * */

(async () => {
  console.log();
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  const start = new Date();
  console.log('> Started on ' + start.toISOString());

  /* * * * * * * * * * * * */

  await PCGIDB.connect();

  /* * */

//   const newLineCharacter = '\n';

  /* * */

  const operatorIds = ['44'];
  const startDate = '2023-01-01T04:00:00';
  const endDate = '2023-03-31T03:59:59';
  const allowedApexValidationStatuses = [0];

  /* * */

  const validationsBetweenDates = {
   //  'transaction.operatorLongID': { '$in': operatorIds },
    'transaction.transactionDate': { $gte: startDate, $lte: endDate },
   //  'transaction.validationStatus': { $in: allowedApexValidationStatuses },
  };

  /* * */

  const validationsCount = await PCGIDB.ValidationEntity.countDocuments(validationsBetweenDates, { allowDiskUse: true, maxTimeMS: 999000 });

  console.log(validationsCount);
  return;

  const validationsStream = await PCGIDB.ValidationEntity.find(validationsBetweenDates, { allowDiskUse: true, maxTimeMS: 999000 }).stream();

  //

  let validationsCounter = 0;

  //

//   let isFirstDoc = true;

  //

  for await (const doc of validationsStream) {
    //

    validationsCounter++;

    // Log progress
    console.log(`> Found matching <validations> transaction | counter: ${validationsCounter} | _id: ${doc._id} | tx_id: ${doc.transaction.transactionId} | apex_version: ${doc.transaction.apexVersion}`);

    // Parse the data
   //  let csvData = Papa.unparse(
   //    [
   //      {
   //        _id: doc._id,
   //        type: 'validations',
   //        transactionId: doc.transaction?.transactionId || 'N/A',
   //        transactionId: doc.transaction?.transactionId || 'N/A',
   //        transactionDate: doc.transaction?.transactionDate || 'N/A',
   //        productLongID: doc.transaction.productLongID || 'N/A',
   //        operatorLongID: doc.transaction.operatorLongID || 'N/A',
   //        lineLongID: doc.transaction.lineLongID || 'N/A',
   //        patternLongID: doc.transaction.patternLongID || 'N/A',
   //        journeyID: doc.transaction.journeyID || 'N/A',
   //        stopLongID: doc.transaction.stopLongID || 'N/A',
   //      },
   //    ],
   //    {
   //      skipEmptyLines: 'greedy',
   //      newline: newLineCharacter,
   //      header: isFirstDoc,
   //    }
   //  );

    //

   //  fs.appendFileSync(`dump_tx.csv`, isFirstDoc ? csvData : newLineCharacter + csvData);

   //  if (isFirstDoc) isFirstDoc = false;

    //
  }

  console.log('DONE');

  //
})();
