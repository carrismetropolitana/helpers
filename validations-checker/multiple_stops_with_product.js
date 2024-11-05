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

  const newLineCharacter = '\n';

  /* * */

  const stopIds = [
	'070514',
	// '070514',
  ];
  const startDate = '2024-05-01T04:00:00';
  const endDate = '2024-06-01T03:59:59';
  const allowedApexValidationStatuses = [0, 4, 6];

  /* * */

  const validationsBetweenDates = {
   //  'transaction.transactionDate': { $gte: startDate, $lte: endDate },
   //  'transaction.validationStatus': { $in: allowedApexValidationStatuses },
    'transaction.stopLongID': { $in: stopIds },
  };

  /* * */

  const countResult = await PCGIDB.ValidationEntity.count(validationsBetweenDates, { allowDiskUse: true, maxTimeMS: 0 });
  console.log(countResult);
//   const validationsStream = await PCGIDB.ValidationEntity.find(validationsBetweenDates, { allowDiskUse: true, maxTimeMS: 0 }).stream();

  //

  let validationsCounter = 0;

  //

  let isFirstDoc = true;

  //

//   for await (const doc of validationsStream) {
//     //

//     validationsCounter++;

//     // Log progress
//     console.log(`> Found matching <validations> transaction | counter: ${validationsCounter} | _id: ${doc._id} | tx_id: ${doc.transaction.transactionId} | date: ${doc.transaction.transactionDate}`);

//     // Parse the data
//    //  let csvData = Papa.unparse(
//    //    [
//    //      {
//    //        _id: doc._id,
//    //        type: 'validations',
//    //        transactionId: doc.transaction?.transactionId || 'N/A',
//    //        transactionId: doc.transaction?.transactionId || 'N/A',
//    //        transactionDate: doc.transaction?.transactionDate || 'N/A',
//    //        productLongID: doc.transaction.productLongID || 'N/A',
//    //        operatorLongID: doc.transaction.operatorLongID || 'N/A',
//    //        lineLongID: doc.transaction.lineLongID || 'N/A',
//    //        patternLongID: doc.transaction.patternLongID || 'N/A',
//    //        journeyID: doc.transaction.journeyID || 'N/A',
//    //        stopLongID: doc.transaction.stopLongID || 'N/A',
//    //      },
//    //    ],
//    //    {
//    //      skipEmptyLines: 'greedy',
//    //      newline: newLineCharacter,
//    //      header: isFirstDoc,
//    //    }
//    //  );

//     //

//    //  fs.appendFileSync(`dump_tx_${stopIds.join('-')}.csv`, isFirstDoc ? csvData : newLineCharacter + csvData);

//    //  if (isFirstDoc) isFirstDoc = false;

//     //
//   }

  console.log('DONE');

  //
})();
