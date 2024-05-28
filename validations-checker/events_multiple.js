/* * */

const fs = require('fs');
require('dotenv').config();
const PCGIDB = require('./PCGIDB');
const { DateTime } = require('luxon');

/* * */

(async () => {
  console.log();
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  const start = new Date();
  console.log('> Started on ' + start.toISOString());

  /* * * * * * * * * * * * */

  await PCGIDB.connect();

  /* * */

  const startDateMillis = DateTime.fromFormat('2024-04-19', 'yyyy-MM-dd').set({hour: 4, minute: 0, second: 0}).toMillis();
  const endDateMillis = DateTime.fromFormat('2024-04-20', 'yyyy-MM-dd').set({hour: 3, minute: 59, second: 59}).toMillis();

  // const startDateMillis = startDate.toMillis();
  // const endDateMillis = endDate.toMillis();

  /* * */

  const query = {
    millis: { $gte: startDateMillis, $lte: endDateMillis },
    'content.entity.vehicle.agencyId': '43',
    // 'content.entity.vehicle.vehicle._id': '2239',
    'content.entity.vehicle.trip.tripId': '3011_0_1_1830_1859_0_ESC_DU',
  };

  /* * */

  console.log('Searching events');
  console.log(query);

  const result = await PCGIDB.VehicleEvents.find(query, { allowDiskUse: true, maxTimeMS: 180000 }).toArray();

  console.log(result);

  const resultString = JSON.stringify(result, null, 2);

  fs.writeFileSync(`events-43-${startDateMillis}-${endDateMillis}.json`, resultString);

  console.log('Events found: ' + result.length);
  console.log('Done!');

  process.exit(0);

  //
})();
