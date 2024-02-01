/* * * * * */
/* MAKE TTS STOP NAMES */
/* * */
/* * */

/* * */
/* IMPORTS */
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

  let allStopsWithLines = [];
  let allStopsWithRoutes = [];
  let allStopsWithPatterns = [];

  //
  // 3. Convert each stop to a line

  for (const stopData of allStopsData) {
    //

    if (!stopData.lines) continue;

    let areas = '';

    for (const lineId of stopData.lines) {
      areas += lineId.substring(0, 1);
    }

    if (areas.includes('1') && areas.includes('2')) {
      allStopsWithLines.push({
        stop_id: stopData.id,
        stop_name: stopData.name,
        stop_lat: stopData.lat,
        stop_lon: stopData.lon,
        lines: stopData.lines?.join('|'),
      });
    }

    allStopsWithRoutes.push({
      stop_id: stopData.id,
      stop_name: stopData.name,
      stop_lat: stopData.lat,
      stop_lon: stopData.lon,
      routes: stopData.routes?.join('|'),
    });

    allStopsWithPatterns.push({
      stop_id: stopData.id,
      stop_name: stopData.name,
      stop_lat: stopData.lat,
      stop_lon: stopData.lon,
      patterns: stopData.patterns?.join('|'),
    });

    //
  }

  //
  // 4. Create the CSV tables

  const allStopsWithLinesCsv = Papa.unparse(allStopsWithLines);
  const allStopsWithRoutesCsv = Papa.unparse(allStopsWithRoutes);
  const allStopsWithPatternsCsv = Papa.unparse(allStopsWithPatterns);

  //
  // 4. Save the CSV data to the disk

  fs.writeFileSync('stops-lines.csv', allStopsWithLinesCsv);
  fs.writeFileSync('stops-routes.csv', allStopsWithRoutesCsv);
  fs.writeFileSync('stops-patterns.csv', allStopsWithPatternsCsv);

  //

  console.log('• Done! Updated ' + allStopsData.length + ' stops.');

  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();
