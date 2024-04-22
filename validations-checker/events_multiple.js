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

  const startDateMillis = 1713524400000;
  const endDateMillis = 1713538800000;

  /* * */

  const query = {
    millis: { $gte: startDateMillis, $lte: endDateMillis },
    'content.entity.vehicle.agencyId': '43',
    'content.entity.vehicle.vehicle._id': '2239',
    // 'content.entity.vehicle.trip.tripId': '3507_0_1_1330_1359_0_ESC_DU',
  };

  /* * */

  console.log('Searching events');
  console.log(query);

  const result = await PCGIDB.VehicleEvents.find(query, { allowDiskUse: true, maxTimeMS: 180000 }).toArray();

  console.log(result);

  const resultString = JSON.stringify(result, null, 2);

  fs.writeFileSync(`events-43-${startDateMillis}-${endDateMillis}.json`, resultString);

  //
})();
