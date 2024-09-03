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

  const startDateMillis = DateTime.fromFormat('2024-07-26', 'yyyy-MM-dd').set({hour: 4, minute: 0, second: 0}).toMillis();
  const endDateMillis = DateTime.fromFormat('2024-07-27', 'yyyy-MM-dd').set({hour: 3, minute: 59, second: 59}).toMillis();

  const agencyId = "41";
  const tripId = "1710_0_2_0430_0459_0_7";

  /* * */

  const query = {
    millis: { $gte: startDateMillis, $lte: endDateMillis },
    'content.entity.vehicle.agencyId': agencyId,
    // 'content.entity.vehicle.vehicle._id': '2239',
    'content.entity.vehicle.trip.tripId': tripId,
  };

  /* * */

  console.log('Searching events');
  console.log(query);

  const result = await PCGIDB.VehicleEvents.find(query, { allowDiskUse: true, maxTimeMS: 180000 }).toArray();

  fs.writeFileSync(`events-${agencyId}-${tripId}-${startDateMillis}-${endDateMillis}.json`, JSON.stringify(result, null, 2));

  console.log('Events found: ' + result.length);
  console.log('Done!');

  process.exit(0);

  //
})();
