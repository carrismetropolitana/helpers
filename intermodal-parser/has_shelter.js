/* * */
/* * */
/* * * * * */
/* GEOBUS SYNC - ROUTES */
/* * */
/* * */

/* * */
/* IMPORTS */
const fs = require('fs');
const Papa = require('papaparse');

const formatStops = async () => {
  //

  //
  // 0. Get latest data from Intermodal

  console.log('• Fetching Intermodal for latest updates...');

  const rawData = await fetch('https://api.intermodal.pt/v1/regions/1/stops/full').then((res) => res.json());
  const allStopsData = await fetch('https://api.carrismetropolitana.pt/stops').then((res) => res.json());

  //
  // 1. Format the raw data from Intermodal

  const result = [];

  console.log('• Preparing ' + rawData.length + ' stops...');

  for (const stop of rawData) {
    //

    // Check if this stop is for Carris Metropolitana
    const stopOperator = stop.operators.find((item) => item.operator_id === 1);
    if (!stopOperator) continue;

    // if (stopOperator.stop_ref.substring(0, 2) !== '18') continue;

    const thisStopData = allStopsData.find((item) => item.id === stopOperator.stop_ref);

    console.log(stop);

    const iuhds = {
      id: 10480,
      name: 'Igreja do Murtal',
      short_name: null,
      locality: null,
      street: null,
      door: null,
      parish: 3,
      lat: 38.702896,
      lon: -9.3618603,
      notes: null,
      tags: [],
      schedules: null,
      flags: null,
      has_sidewalk: null,
      has_sidewalked_path: null,
      has_shelter: null,
      has_cover: null,
      has_bench: null,
      has_trash_can: null,
      has_waiting_times: null,
      has_ticket_seller: null,
      has_costumer_support: null,
      advertisement_qty: null,
      has_crossing: null,
      has_wide_access: null,
      has_flat_access: null,
      has_tactile_access: null,
      illumination_strength: null,
      illumination_position: null,
      has_illuminated_path: null,
      has_visibility_from_within: null,
      has_visibility_from_area: null,
      is_visible_from_outside: null,
      parking_visibility_impairment: null,
      parking_local_access_impairment: null,
      parking_area_access_impairment: null,
      tmp_issues: [],
      verification_level: 192,
      service_check_date: null,
      infrastructure_check_date: null,
      updater: 1,
      osm_id: 8140011563,
      operators: [
        {
          operator_id: 1,
          stop_ref: '050478',
          name: 'Av Maria Lamas - Igreja',
          source: 'osm',
        },
      ],
      verified_position: true,
      update_date: '2022-11-21T23:18:46.674962Z',
    };

    // Create file
    result.push({
      stop_id: stopOperator.stop_ref,
      stop_lat: stop.lat.toFixed(6),
      stop_lon: stop.lon.toFixed(6),
      stop_name: stopOperator.name,

      has_shelter: stop.has_shelter,
      has_shelter: stop.has_shelter,
      has_shelter: stop.has_shelter,
      has_shelter: stop.has_shelter,

      imd_id: stop.id,
      lines: thisStopData?.lines?.join('|'),
    });
  }

  //
  // 2. Save the formatted data into a JSON file

  console.log('• Saving data to JSON file.');

  const jsonFilename = 'intermodal-has_shelter.json';
  const jsonData = JSON.stringify(result);
  fs.writeFile(jsonFilename, jsonData, 'utf8', (err) => {
    if (err) {
      console.log('! An error occured while writing data to JSON file.');
      return console.log(err);
    }
    console.log('• JSON file has been created.');
  });

  //
  // 3. Save the formatted data into a CSV file

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

  console.log('• Done! Kept ' + result.length + ' stops and created 2 files.');
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
