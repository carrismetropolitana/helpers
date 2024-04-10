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

  /* * */

  const startDateString = '2024-01-10T10:00:00';
  const endDateString = '2024-01-10T11:00:00';

  /* * */

  console.log('Start search...');

  const result = await REALTIMEDB.ValidationEntity.aggregate(
    [
      // Match documents within the specified day
      {
        $match: {
          'transaction.operatorLongID': { $in: ['44'] },
          'transaction.transactionDate': { $gte: startDateString, $lte: endDateString },
        },
      },
      // Group documents by samSerialNumber machine
      {
        $group: {
          _id: '$transaction.macDataFields.samSerialNumber',
          minAseCounterValue: { $min: '$transaction.macDataFields.aseCounterValue' },
          maxAseCounterValue: { $max: '$transaction.macDataFields.aseCounterValue' },
        },
      },
      // Project to generate a sequence of counter values for each samSerialNumber machine
      {
        $project: {
          _id: 1,
          aseCounterValues: {
            $range: ['$minAseCounterValue', { $add: ['$maxAseCounterValue', 1] }],
          },
        },
      },
      // Unwind the aseCounterValues array
      {
        $unwind: '$aseCounterValues',
      },
      // Perform left outer join with the actual documents
      {
        $lookup: {
          from: 'validationEntity',
          let: { samSerialNumber: '$_id', counter: '$aseCounterValues' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$transaction.macDataFields.samSerialNumber', '$$samSerialNumber'] }, { $eq: ['$transaction.macDataFields.aseCounterValue', '$$counter'] }],
                },
              },
            },
          ],
          as: 'matchedTransactions',
        },
      },
      // Filter out the matched documents
      {
        $match: {
          matchedTransactions: { $size: 0 },
        },
      },
      // Group by samSerialNumber machine to count missing transactions
      {
        $group: {
          _id: '$_id',
          missingTransactions: { $sum: 1 },
        },
      },
    ],
    { allowDiskUse: true, maxTimeMS: 999000 }
  ).toArray();

  //

  console.log(result);

  //
})();
