/* * */

const fs = require('fs');
const Papa = require('papaparse');

/* * */

(async () => {
  console.log();
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log('> PARSER');
  const start = new Date();
  console.log('> Parsing started on ' + start.toISOString());

  //
  // 1. Setup variables

  //
  // 2. Import all GTFS files

  const stopsTxt = Papa.parse(fs.readFileSync('./gtfs/stops.txt', { encoding: 'utf-8' }), { header: true }).data;
  const tripsTxt = Papa.parse(fs.readFileSync('./gtfs/trips.txt', { encoding: 'utf-8' }), { header: true }).data;
  const routesTxt = Papa.parse(fs.readFileSync('./gtfs/routes.txt', { encoding: 'utf-8' }), { header: true }).data;
  const stopTimesTxt = Papa.parse(fs.readFileSync('./gtfs/stop_times.txt', { encoding: 'utf-8' }), { header: true }).data;

  //
  // 3. Convert each stop to a line

  // Initialize an empty Set to store unique stop sequences
  const uniqueStopSequences = new Set();

  // Iterate over each stop time entry to extract unique stop sequences
  tripsTxt
    .sort((a, b) => a.route_id.localeCompare(b.route_id))
    .forEach((tripData) => {
      //
      const tripId = tripData.trip_id;

      // Find the stopTimes for this trip
      const stopTimesForThisTrip = stopTimesTxt.filter((stopTime) => stopTime.trip_id === tripId);

      // Simplify the stopTimes to only include the stop_ids
      const sortedStopSequence = stopTimesForThisTrip.sort((a, b) => a.stop_sequence.localeCompare(b.stop_sequence)).map((stopTime) => stopTime.stop_id);

      // Add the trip_id to this stop_sequence
      const parsedPattern = {
        route_id: tripData.route_id,
        route_short_name: routesTxt.find((item) => item.route_id === tripData.route_id).route_short_name,
        direction_id: tripData.direction_id,
        shape_id: tripData.shape_id,
        stop_sequence: sortedStopSequence,
      };

      uniqueStopSequences.add(JSON.stringify(parsedPattern));

      console.log(`route_id: ${tripData.route_id} | trip_id: ${tripData.trip_id} | uniqueStopSequences.size: ${uniqueStopSequences.size}`);

      //
    });

  let counter = 0;
  let allUniquePatterns = [];

  uniqueStopSequences.forEach((item) => {
    counter++;
    // Parse the item
    const parsedItem = JSON.parse(item);
    // Parse the stop for each sequence
    parsedItem.stop_sequence.forEach((stop, index) => {
      const stopData = stopsTxt.find((item) => item.stop_id === stop);
      allUniquePatterns.push({
        pattern_id_tml_temp: `${parsedItem.route_id}_${counter}`,
        route_id: parsedItem.route_id,
        route_short_name: parsedItem.route_short_name,
        direction_id: parsedItem.direction_id,
        shape_id: parsedItem.shape_id,
        stop_sequence: index,
        stop_id: stop,
        stop_name: stopData.stop_name,
        stop_lat: stopData.stop_lat,
        stop_lon: stopData.stop_lon,
      });
    });
  });

  const csvData = Papa.unparse(allUniquePatterns);

  fs.writeFileSync('./gtfs/result.csv', csvData, 'utf8', (err) => {
    if (err) {
      console.log('! An error occured while writing data to CSV file.');
      return console.log(err);
    }
    console.log('• CSV file has been created.');
  });

  //

  console.log('• Done!');

  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();
