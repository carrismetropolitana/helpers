/* * */

const fs = require('fs');
require('dotenv').config();
const PCGIDB = require('./PCGIDB');

/* * */

(async () => {
  console.log();
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  const start = new Date();
  console.log('> Started on ' + start.toISOString());

  /* * * * * * * * * * * * */

  await PCGIDB.connect();

  /* * */

  console.log('Fetching TXs...');

  // const allTxIds = await PCGIDB.ValidationEntity.find({ 'transaction.transactionDate': { $gte: '2024-04-01T04:00:00', $lte: '2024-04-02T03:59:59' } }, '_id', { allowDiskUse: true, maxTimeMS: 180000 }).toArray();

  const allTxIds = await PCGIDB.ValidationEntity.aggregate([
    {
      $match: {
        transactionDate: { $gte: '2024-04-01T04:00:00', $lte: '2024-04-02T03:59:59' },
        transactionType: 11
      }
    },
    {
      $group: { _id: "$transactionId" }
    },
    {
      $count: "countDistinctTransactionIds"
    }
  ], { allowDiskUse: true, maxTimeMS: 180000 }).toArray();

  console.log('Found tx count:', allTxIds.length)

  const resultString = JSON.stringify(allTxIds.map((item)=>item._id), null, 2);

  fs.writeFileSync(`all-tx-ids-20240401.json`, resultString);

  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();
