/* * */

const fs = require('fs');
const Papa = require('papaparse');

/* * */

const formatStops = async () => {
  //

  //
  // 0. Get latest data from Intermodal

  console.log('• Fetching Intermodal for latest updates...');

  const rawData = await fetch('https://api.intermodal.pt/v1/regions/1/stops/full').then((res) => res.json());

  //
  // 1. Format the raw data from Intermodal

  const result = [];

  console.log('• Preparing ' + rawData.length + ' stops...');

  for (const stop of rawData) {
    //

    // Check if this stop is for Carris Metropolitana
    const stopOperator = stop.operators.find((item) => item.operator_id === 1);
    if (!stopOperator) continue;

    // if (stopOperator.name.substring(0, 2) !== '02') continue;

    // Create file
    result.push({
      stop_id: stopOperator.name,
      stop_lat: stop.lat.toFixed(6),
      stop_lon: stop.lon.toFixed(6),
      stop_name: stopOperator.stop_ref,
      has_shelter: stop.has_shelter ? 1 : 0,
      imd_id: stop.id,
    });
  }

  //
  // 2. Save the formatted data into a CSV file

  console.log('• Saving data to CSV file.');

  const csvFilename = 'intermodal-has_shelter.csv';
  const csvData = Papa.unparse(result, { header: true });
  fs.writeFile(csvFilename, csvData, 'utf8', (err) => {
    if (err) {
      console.log('! An error occured while writing data to CSV file.');
      return console.log(err);
    }
    console.log('• CSV file has been created.');
  });

  console.log('• Done! Kept ' + result.length + ' stops and created 1 file.');
};

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
  /* */ await formatStops();
  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();
