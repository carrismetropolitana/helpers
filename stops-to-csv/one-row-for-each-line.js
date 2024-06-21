/* * * * * */
/* MAKE TTS STOP NAMES */
/* * */
/* * */

const fs = require('fs');
const Papa = require('papaparse');

/* * *
 * ONE TIME EXECUTION
 */
(async () => {
  console.log();
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log('> PARSER');
  const start = new Date();
  console.log('> Parsing started on ' + start.toISOString());

  /* * * * * * * * * * * * */

  console.log('• Converting all stops to CSV...');

  //
  // 1. Get all stops from the API

  const allStopsResponse = await fetch('https://api.carrismetropolitana.pt/stops');
  const allStopsData = await allStopsResponse.json();

  //
  // 2. Prepare variables

  // let allStopsWithoutService = [];
  let allStopAndAllLines = [];

  //
  // 3. Convert each stop to a line

  for (const stopData of allStopsData) {
    //

    const areas = new Set();

    for (const lineId of stopData.lines) {
      areas.add(lineId.substring(0, 1));
    }

	 for (const lineId of stopData.lines) {
		 allStopAndAllLines.push({
			stop_id: stopData.id,
			facilities: stopData.facilities.join('|'),
			stop_name: stopData.name,
			stop_lat: stopData.lat,
			stop_lon: stopData.lon,
			lines: lineId,
		 });
	 }

    //
  }

  //
  // 4. Create the CSV tables

  const allStopAndAllLinesCsv = Papa.unparse(allStopAndAllLines);

  //
  // 4. Save the CSV data to the disk

  fs.writeFileSync('allStopAndAllLines.csv', allStopAndAllLinesCsv);

  //

  console.log('• Done! Updated ' + allStopsData.length + ' stops.');

  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();
