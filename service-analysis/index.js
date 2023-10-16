/* * */
/* SERVICE ANALYSIS */
/* * */

require('dotenv').config();

/* * */

const SETTINGS = {
  service_radius_meters: 400, // meters
  max_travel_time_seconds: 120, // seconds
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

    console.log(`• Preparing [${locationData.id}] ${locationData.name} ...`);

    //
    // 3.1.
    // Build service radius for this location

    console.log(locationData.lon, locationData.lat);

    const locationPoint = turf.point([locationData.lon, locationData.lat]);
    const serviceRadius = turf.buffer(locationPoint, SETTINGS.service_radius_meters, { units: 'meters' });

    //
    // 3.2.
    // Get stops that are inside service radius

    const allStopsInsideServiceRadius = allStopsData.forEach((stopData) => {
      const point = turf.point([stopData.lat, stopData.lon]);
      const serviceRadiusContainsPoint = turf.booleanContains(serviceRadius, point);
      return serviceRadiusContainsPoint;
    });

    //
    // 3.3.
    // Calculate travel time for each stop inside service radius

    const stopIdsThatServeThisLocation = new Set();

    for (const stopData of allStopsInsideServiceRadius) {
      const travelTimeInSecondsFromLocationToStop = await getDirectionsBetweenTwoPoints({ lat: locationData.lat, lon: locationData.lon }, { lat: stopData.lat, lon: stopData.lon });
      if (travelTimeInSecondsFromLocationToStop < SETTINGS.max_travel_time_seconds) stopIdsThatServeThisLocation.add(stopData.id);
    }

    //
    // 3.4.
    // Save analysis result for this location

    serviceAnalysisResult.push({
      location_id: locationData.id,
      location_name: locationData.name,
      location_lat: locationData.lat,
      location_lon: locationData.lon,
      associated_stops: stopIdsThatServeThisLocation.values().join('|'),
    });

    //
    // 3.5.
    // Introduce artificial delay to avoid hitting any rate-limits

    await delay(500);

    //
  }

  //
  // 4.
  // Save analysis result to CSV table

  console.log('• Saving service analysis result to CSV file...');
  const serviceAnalysisCsv = Papa.unparse(serviceAnalysisResult, { skipEmptyLines: 'greedy' });
  fs.writeFileSync(`service_analysis_result.csv`, serviceAnalysisCsv);
  console.log('• Done! Updated ' + foundMatches.length + ' postal codes.');

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

  const requestUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking';

  const requestHeaders = {
    Accept: 'application/json, application/geo+json; charset=utf-8',
    Authorization: process.env.ORS_API_KEY,
    'Content-Type': 'application/json; charset=utf-8',
  };

  const requestBody = {
    units: 'm',
    geometry: 'true',
    elevation: 'true',
    preference: 'shortest',
    coordinates: [
      [pointA.lon, pointA.lat],
      [pointB.lon, pointB.lat],
    ],
  };

  const directionsApiResponse = await fetch(requestUrl, { method: 'POST', headers: requestHeaders, body: JSON.stringify(requestBody) });
  const directionsApiData = await directionsApiResponse.json();

  const directionsDataSorted = directionsApiData.routes.sort((a, b) => a.summary.duration - b.summary.duration);
  return directionsDataSorted;

  //
}

function delay(miliseconds = 0) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}
