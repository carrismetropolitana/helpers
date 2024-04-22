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

  const operatorIds = ['41'];
  const startDate = '2024-01-01T04:00:00';
  const endDate = '2024-02-01T03:59:59';

  /* * */

  const salesBetweenDates = {
    'transaction.operatorLongID': { $in: operatorIds },
    'transaction.transactionDate': { $gte: startDate, $lte: endDate },
    'transaction.productLongID': { $regex: /^id-prod-tar/ },
  };

  /* * */

  const salesStream = PCGIDB.SalesEntity.find(salesBetweenDates, { allowDiskUse: true, maxTimeMS: 999000 }).stream();

  //

  let salesCounter = 0;

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
          operatorLongID: doc.transaction?.operatorLongID || 'N/A',
          transactionDate: doc.transaction?.transactionDate || 'N/A',
          productLongID: doc.transaction?.productLongID || 'N/A',
          price: doc.transaction?.price || 'N/A',
        },
      ],
      {
        skipEmptyLines: 'greedy',
        newline: newLineCharacter,
        header: isFirstDoc,
      }
    );

    //

    fs.appendFileSync(`dump_tx_sales_${startDate}_${endDate}.csv`, isFirstDoc ? csvData : newLineCharacter + csvData);

    if (isFirstDoc) isFirstDoc = false;

    //
  }

  salesStream.on('end', () => {
    console.log('DONE :)');
  });

  //
})();
