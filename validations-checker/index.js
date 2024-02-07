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

  const simple = { _id: '2a7264ab-c91b-4ce8-be1e-b000ebf0d3f1' };

  const tarifasDeBordo = {
    'transaction.transactionDate': {
      $gte: '2024-01-01T04:00:00',
      $lte: '2024-02-01T03:59:59',
    },
    operator: '43',
    'transaction.productLongID': {
      $in: ['id-prod-tarifa-rapida', 'id-prod-tarifa-local', 'id-prod-tarifa-urbano', 'id-prod-tarifa-praia', 'id-prod-tarifa-local-bon-3223-43'],
    },
  };

  const preComprado = {
    'transaction.transactionDate': {
      $gte: '2024-01-01T04:00:00',
      $lte: '2024-02-01T03:59:59',
    },
    // operator: '43',
    'transaction.productLongID': 'id-prod-zapping',
  };

  const apex311 = {
    operator: '42',
    'transaction.transactionDate': {
      $gte: '2024-02-05T04:00:00',
      //   $lte: '2024-02-01T03:59:59',
    },
    // 'transaction.apexVersion': '3.1.1',
  };

  /* * */

  let isFirstDoc = true;
  let counter = 0;

  const resultStream = REALTIMEDB.ValidationEntity.find(apex311, { allowDiskUse: true, maxTimeMS: 180000 }).stream(); // .pipe(jsonToCsv()).pipe(fs.createWriteStream('./data.csv'));

  resultStream.on('error', function (err) {
    console.error(err);
  });

  resultStream.on('data', function (doc) {
    console.log('counter', counter, 'apexVersion', doc.transaction.apexVersion, 'apexTransactionVersion', doc.transaction.apexTransactionVersion);
    counter++;
    // if (!doc.transaction.apexVersion.startsWith('3')) return;
    const csvData = Papa.unparse(
      [
        {
          _id: doc._id,
          'transaction.validationType': doc.transaction.validationType,
          'transaction.productLongID': doc.transaction.productLongID,
          'transaction.tickLoadDate': doc.transaction.tickLoadDate,
          'transaction.tickLoadMachCode': doc.transaction.tickLoadMachCode,
          'transaction.tickLoadNumbDaily': doc.transaction.tickLoadNumbDaily,
          'transaction.unitsRemaining': doc.transaction.unitsRemaining,
          'transaction.contractNumber': doc.transaction.contractNumber,
          'transaction.eventType': doc.transaction.eventType,
          'transaction.validationStatus': doc.transaction.validationStatus,
          'transaction.whiteListItemID': doc.transaction.whiteListItemID,
          'transaction.calendarID': doc.transaction.calendarID,
          'transaction.spatialValidityLongID': doc.transaction.spatialValidityLongID,
          'transaction.productMatrixElementID': doc.transaction.productMatrixElementID,
          'transaction.validationDataLongID': doc.transaction.validationDataLongID,
          'transaction.profilesUsedCount': doc.transaction.profilesUsedCount,
          'transaction.profilesUsedData': doc.transaction.profilesUsedData,
          'transaction.greylistItemCount': doc.transaction.greylistItemCount,
          'transaction.greyListItemsData': doc.transaction.greyListItemsData,
          'transaction.validatorID': doc.transaction.validatorID,
          'transaction.stopLongID': doc.transaction.stopLongID,
          'transaction.operationPlanID': doc.transaction.operationPlanID,
          'transaction.vehicleID': doc.transaction.vehicleID,
          'transaction.zoneLongID': doc.transaction.zoneLongID,
          'transaction.cardTypeID': doc.transaction.cardTypeID,
          'transaction.cardPhysicalType': doc.transaction.cardPhysicalType,
          'transaction.cardNetworkID': doc.transaction.cardNetworkID,
          'transaction.cardIssuer': doc.transaction.cardIssuer,
          //   'transaction.cardNumber.$numberLong': doc.transaction.cardNumber.$numberLong,
          'transaction.cardSerialNumber': doc.transaction.cardSerialNumber,
          'transaction.operatorLongID': doc.transaction.operatorLongID,
          'transaction.networkID': doc.transaction.networkID,
          'transaction.channelID': doc.transaction.channelID,
          'transaction.deviceID': doc.transaction.deviceID,
          'transaction.apexVersion': doc.transaction.apexVersion,
          'transaction.vivaVersion': doc.transaction.vivaVersion,
          'transaction.technicalParametersVersion': doc.transaction.technicalParametersVersion,
          'transaction.commercialOfferVersion': doc.transaction.commercialOfferVersion,
          'transaction.networkVersion': doc.transaction.networkVersion,
          'transaction.actionListsVersion': doc.transaction.actionListsVersion,
          'transaction.apexTransactionType': doc.transaction.apexTransactionType,
          'transaction.apexTransactionVersion': doc.transaction.apexTransactionVersion,
          'transaction.transactionId': doc.transaction.transactionId,
          'transaction.transactionGroupId': doc.transaction.transactionGroupId,
          'transaction.transactionDate': doc.transaction.transactionDate,
          'transaction.signedData': doc.transaction.signedData,
          'transaction.mac': doc.transaction.mac,
          createdAt: doc.createdAt,
          batchId: doc.batchId,
          operator: doc.operator,
          siitState: doc.siitState,
          csvTransaction: doc.csvTransaction,
          errorList: doc.errorList.join('|'),
          _class: doc._class,
        },
      ],
      { quotes: true, header: isFirstDoc }
    );
    fs.appendFileSync(`/outputs/result.csv`, csvData);
    if (isFirstDoc) isFirstDoc = false;
  });

  resultStream.on('end', function () {
    REALTIMEDB.client.close();
    console.log('closing connection');
  });

  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();
