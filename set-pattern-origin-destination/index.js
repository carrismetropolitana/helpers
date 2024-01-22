/* * */

const fs = require('fs');
const Papa = require('papaparse');

/* * */

const findPostalCodes = async () => {
  //

  //
  // 0. Get all routes info

  console.log('• Parsing routes.txt...');

  const txtData = fs.readFileSync('routes.txt', { encoding: 'utf8' });

  const allRoutesData = Papa.parse(txtData, { header: true });

  //
  // 1. Format the raw data

  const parsedRoutes = [];

  console.log('• Preparing ' + allRoutesData.data.length + ' routes...');
  console.log();

  for (const [index, routeData] of allRoutesData.data.entries()) {
    //

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Updating route ${routeData.route_id} (${index}/${allRoutesData.data.length})`);

    parsedRoutes.push({
      route_id: routeData.route_id,
      origin: routeData.route_origin,
      destination: routeData.route_destination,
    });

    //
  }

  //
  // 2. Save the formatted data into a JSON file

  console.log('• Saving data to JSON file.');
  fs.writeFileSync(`routes.json`, JSON.stringify(parsedRoutes));

  //

  console.log('• Done! Updated ' + parsedRoutes.length + ' postal codes.');
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
  /* */ await findPostalCodes();
  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();

function delay(miliseconds = 0) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}
