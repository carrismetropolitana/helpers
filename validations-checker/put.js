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

  const operatorIds = ['41'];
  const startDate = '2024-01-02T04:00:00';
  const endDate = '2024-01-03T03:59:59';

  const allowedApexValidationStatuses = [12];
  //   const allowedApexValidationStatuses = [0, 8];

  /* * */

  const totalValidTransactions = {
    'transaction.operatorLongID': { $in: operatorIds },
    'transaction.transactionDate': { $gte: startDate, $lte: endDate },
    'transaction.validationStatus': { $in: allowedApexValidationStatuses },
  };

  const totalValidOnBoardSales = {
    'transaction.operatorLongID': { $in: operatorIds },
    'transaction.transactionDate': { $gte: startDate, $lte: endDate },
    'transaction.validationStatus': { $in: allowedApexValidationStatuses },
  };

  /* * */

  const resultPax = await REALTIMEDB.ValidationEntity.aggregate(
    [
      {
        $match: totalValidTransactions,
      },
      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 },
        },
      },
      {
        $count: 'totalUnique',
      },
    ],
    { allowDiskUse: true, maxTimeMS: 180000 }
  ).toArray();

  console.log('Total PAX', resultPax.length && resultPax[0]?.totalUnique);

  //   const resultPut = await REALTIMEDB.ValidationEntity.aggregate(
  //     [
  //       {
  //         $match: totalValidTransactions,
  //       },
  //       {
  //         $group: {
  //           _id: '$transaction.cardSerialNumber',
  //           count: { $sum: 1 },
  //         },
  //       },
  //       {
  //         $count: 'totalUnique',
  //       },
  //     ],
  //     { allowDiskUse: true, maxTimeMS: 180000 }
  //   ).toArray();

  //   console.log('Total PUT', resultPut[0].totalUnique);

  //   console.log('Total PUT/PAX', resultPut[0].totalUnique / resultPax[0].totalUnique);

  await REALTIMEDB.client.close();

  //
})();
