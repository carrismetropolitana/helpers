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

  const operatorIds = ['43'];
  const lineIds = ['2150', '2131', '2111', '2129', '2130', '2137', '2119', '2114', '2139', '2138', '2115', '2102', '2140', '2101', '2152'];
  const stopIds = [
	'020123',
	'020124',
	'020125',
	'020127',
	'020128',
	'020129',
	'020130',
	'020131',
	'020132',
	'020137',
	'020139',
	'020141',
	'020142',
	'020195',
	'020197',
	'020585',
	'020586',
	'020587',
	'020588',
	'020589',
	'020590',
	'020603',
	'020605',
	'020606',
	'020611',
	'020612',
	'020613',
	'020668',
	'020669',
	'020701',
  ];
  const startDate = '2024-01-01T04:00:00';
  const endDate = '2024-06-24T03:59:59';
  const allowedApexValidationStatuses = [0];

  /* * */

  const validationsBetweenDates = {
   //  'transaction.operatorLongID': { $in: operatorIds },
    'transaction.transactionDate': { $gte: startDate, $lte: endDate },
    'transaction.validationStatus': { $in: allowedApexValidationStatuses },
   //  'transaction.lineLongID': { $in: lineIds },
    // 'transaction.journeyLongID': '1221_0_2_1430_1459_0_1',
    'transaction.stopLongID': { $in: stopIds },
  };

  /* * */

  const validationsStream = await PCGIDB.ValidationEntity.find(validationsBetweenDates, { allowDiskUse: true, maxTimeMS: 999000 }).stream();

  //

  let validationsCounter = 0;

  //

  let isFirstDoc = true;

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
          transactionId: doc.transaction?.transactionId || 'N/A',
          transactionDate: doc.transaction?.transactionDate || 'N/A',
          productLongID: doc.transaction.productLongID || 'N/A',
          operatorLongID: doc.transaction.operatorLongID || 'N/A',
          lineLongID: doc.transaction.lineLongID || 'N/A',
          patternLongID: doc.transaction.patternLongID || 'N/A',
          journeyID: doc.transaction.journeyID || 'N/A',
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

    fs.appendFileSync(`dump_tx_${stopIds.join('-')}.csv`, isFirstDoc ? csvData : newLineCharacter + csvData);

    if (isFirstDoc) isFirstDoc = false;

    //
  }

  console.log('DONE');

  //
})();
