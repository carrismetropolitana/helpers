/* * */
/* SERVICE ANALYSIS */
/* * */

require('dotenv').config();

/* * */

const SETTINGS = {
  service_radius_meters: 500, // meters
  max_travel_time_seconds: 600, // seconds
};

/* * */

const fs = require('fs');
const Papa = require('papaparse');
const turf = require('@turf/turf');

/* * */

(async () => {
  //

  console.log();
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log('> SERVICE ANALYSIS');
  const start = new Date();
  console.log('> Service Analysis started on ' + start.toISOString());

  //
  // 1.
  // Read input file and parse data as JSON

  console.log('• Reading input file...');
  const allLocationsCsv = fs.readFileSync('locations_input.csv', { encoding: 'utf8' });
  const allLocationsData = Papa.parse(allLocationsCsv, { header: true });

  //
  // 2.
  // Get all stops from API

  console.log('• Fetching all stops from API...');
  const allStopsResponse = await fetch('https://api.carrismetropolitana.pt/stops');
  const allStopsData = await allStopsResponse.json();

  //
  // 3.
  // Analyse service for each location

  const serviceAnalysisResult = [];

  for (const locationData of allLocationsData.data) {
    //

    //
    // 3.1.
    // Build service radius for this location

    const locationPoint = turf.point([parseFloat(locationData.lon), parseFloat(locationData.lat)]);
    const serviceRadius = turf.buffer(locationPoint, SETTINGS.service_radius_meters, { units: 'meters' });

    //
    // 3.2.
    // Get stops that are inside service radius

    const allStopsInsideServiceRadius = allStopsData.filter((stopData) => {
      const point = turf.point([stopData.lon, stopData.lat]);
      const serviceRadiusContainsPoint = turf.booleanContains(serviceRadius, point);
      return serviceRadiusContainsPoint;
    });

    //
    // 3.3.
    // Calculate travel time for each stop inside service radius

    const stopIdsThatServeThisLocation = new Set();

    for (const stopData of allStopsInsideServiceRadius) {
      const travelTimeInSecondsFromLocationToStop = await getDirectionsBetweenTwoPoints([locationData.lon, locationData.lat], [stopData.lon, stopData.lat]);
      if (travelTimeInSecondsFromLocationToStop && travelTimeInSecondsFromLocationToStop.length) {
        if (travelTimeInSecondsFromLocationToStop[0]?.summary?.duration < SETTINGS.max_travel_time_seconds) {
          stopIdsThatServeThisLocation.add(stopData.id);
        }
      }
    }

    //
    // 3.4.
    // Save analysis result for this location

    const analysisResult = {
      id: locationData.id,
      name: locationData.name,
      lat: locationData.lat,
      lon: locationData.lon,
      stops: Array.from(stopIdsThatServeThisLocation).join('|'),
    };

    serviceAnalysisResult.push(analysisResult);

    console.log(`• (${analysisResult.id}) ${analysisResult.name} > [${analysisResult.stops}]`);

    //
  }

  //
  // 4.
  // Save analysis result to CSV table

  console.log('• Saving service analysis result to CSV file...');
  const serviceAnalysisCsv = Papa.unparse(serviceAnalysisResult, { skipEmptyLines: 'greedy' });
  fs.writeFileSync(`service_analysis_result.csv`, serviceAnalysisCsv);
  console.log('• Done! Updated ' + serviceAnalysisResult.length + ' postal codes.');

  //

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();

  //
})();

/* * */

async function getDirectionsBetweenTwoPoints(pointA, pointB) {
  //

  await delay(0); // Introduce artificial delay to avoid hitting any rate-limits

  //   const requestUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking';
  const requestUrl = 'http://localhost:8080/ors/v2/directions/foot-walking';

  const requestHeaders = {
    Accept: 'application/json, application/geo+json; charset=utf-8',
    Authorization: process.env.ORS_API_KEY,
    'Content-Type': 'application/json; charset=utf-8',
  };

  const requestBody = {
    units: 'm',
    geometry: false,
    elevation: false,
    preference: 'shortest',
    coordinates: [pointA, pointB],
  };

  const directionsApiResponse = await fetch(requestUrl, { method: 'POST', headers: requestHeaders, body: JSON.stringify(requestBody) });
  const directionsApiData = await directionsApiResponse.json();

  const directionsDataSorted = directionsApiData.routes?.sort((a, b) => a.summary.duration - b.summary.duration);
  return directionsDataSorted;

  //
}

function delay(miliseconds = 0) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}
