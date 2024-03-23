/* * */

const fs = require('fs');
require('dotenv').config();
const REALTIMEDB = require('./REALTIMEDB');

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

  const vehicleEvents = {
    _id: REALTIMEDB.toObjectId('63f3c6a1ed979d22848c296f'),
  };

  /* * */

  const result = await REALTIMEDB.VehicleEvents.find(vehicleEvents, { allowDiskUse: true, maxTimeMS: 180000 }).toArray();

  const resultString = JSON.stringify(result, null, 2);

  fs.writeFileSync(`event-41-1106.json`, resultString);

  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();
