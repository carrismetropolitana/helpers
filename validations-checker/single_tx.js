/* * */

const fs = require('fs');
require('dotenv').config();
const PCGIDB = require('./PCGIDB');
const allTxIds = require('./txIds.json');

/* * */

(async () => {
  console.log();
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  const start = new Date();
  console.log('> Started on ' + start.toISOString());

  /* * * * * * * * * * * * */

  await PCGIDB.connect();

  /* * */

  const transactionId = { $in: allTxIds };

  /* * */

  for (const [index, txId] of allTxIds.entries()) {
    const resultSales = await PCGIDB.SalesEntity.find({ 'transaction.transactionId': txId }, '_id', { allowDiskUse: true, maxTimeMS: 180000 }).toArray();
    const resultValidation = await PCGIDB.ValidationEntity.find({ 'transaction.transactionId': txId }, '_id', { allowDiskUse: true, maxTimeMS: 180000 }).toArray();
    const resultLocation = await PCGIDB.LocationEntity.find({ 'transaction.transactionId': txId }, '_id', { allowDiskUse: true, maxTimeMS: 180000 }).toArray();

    const resultFile = await PCGIDB.TransactionEntity.find({ transactionId: txId }, '_id', { allowDiskUse: true, maxTimeMS: 180000 }).toArray();

    if (resultSales.length || resultValidation.length || resultLocation.length) console.log(`counter: ${index} | tx_id: ${txId} | type: ${resultSales.length && 'sales'} ${resultValidation.length && 'validations'} ${resultLocation.length && 'location'}`);
    else if (resultFile.length) console.log(`counter: ${index} | tx_id: ${txId} | type: tx found with errors`);
    else console.log(`counter: ${index} | tx_id: ${txId} | type: TX NOT FOUND`);

    //
  }

  //   const resultString = JSON.stringify(result, null, 2);

  //   fs.writeFileSync(`event-41-1106.json`, resultString);

  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();
