/* * * * * */
/* MAKE TTS STOP NAMES */
/* * */
/* * */

/* * */
/* IMPORTS */
const fs = require('fs');
const Papa = require('papaparse');
const { Client } = require('@googlemaps/google-maps-services-js');
require('dotenv').config();
const { GOOGLE_API_KEY } = process.env;

const formatcsvRows = async () => {
  //

  //

  console.log('• Parsing file...');

  const txtData = fs.readFileSync('FILENAME_HERE.csv', { encoding: 'utf8' });

  const originalCsvData = Papa.parse(txtData, { header: true });

  //
  // 1. Format the raw data from Intermodal

  const updatedCsvRows = [];

  console.log('• Preparing ' + originalCsvData.data.length + ' CSV rows...');
  console.log();

  for (const [index, csvRow] of originalCsvData.data.entries()) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Updating csvRow ${csvRow.csvRow_id} (${index}/${originalCsvData.data.length})`);
    //
    try {
      //

      //   const geocoderQuery = `${csvRow.csvRow_name}, ${csvRow.address}, ${csvRow.postal_code}, ${csvRow.locality}, Portugal`;
      const geocoderQuery = `${csvRow.csvRow_name}, ${csvRow.address}, ${csvRow.municipality_dgeec}, Portugal`;
      //   const geocoderQuery = `csvRow at ${csvRow.address}, ${csvRow.postal_code} ${csvRow.municipality_dgeec}, Portugal`;

      const client = new Client({});
      const response = await client.findPlaceFromText({
        params: {
          input: geocoderQuery,
          inputtype: 'textquery',
          language: 'pt',
          fields: ['geometry', 'place_id'],
          key: GOOGLE_API_KEY,
        },
        timeout: 1000, // milliseconds
      });
      //
      updatedCsvRows.push({
        csvRow_id: csvRow.csvRow_id,
        csvRow_name: csvRow.csvRow_name,
        coordinates_lat: response.data.candidates[0].geometry.location.lat,
        coordinates_lon: response.data.candidates[0].geometry.location.lng,
      });
      console.log('Success', csvRow.csvRow_id, csvRow.csvRow_name, response.data.candidates[0].geometry.location.lat, response.data.candidates[0].geometry.location.lng);
    } catch (error) {
      //   console.log(error);
      console.log('Error', csvRow.csvRow_id, csvRow.csvRow_name, error);
    }
    await delay(250);
    //
  }

  //
  // 2. Save the formatted data into a JSON file

  console.log('• Saving data to CSV file.');

  // Use papaparse to produce the CSV string
  const csvData = Papa.unparse(updatedCsvRows, { skipEmptyLines: 'greedy' });
  // Append the csv string to the file
  fs.writeFileSync(`RESULT_FILENAME.csv`, csvData);

  //

  console.log('• Done! Updated ' + updatedCsvRows.length + ' csvRows.');
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
  /* */ await formatcsvRows();
  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();

function delay(miliseconds = 0) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}
