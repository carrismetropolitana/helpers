/* * */
/* SERVICE ANALYSIS */
/* * */

// require('dotenv').config();

/* * */

const SETTINGS = {
	max_travel_time_seconds: 600, // seconds
	service_radius_meters: 500, // meters
};

/* * */

const turf = require('@turf/turf');
const fs = require('fs');
const Papa = require('papaparse');

/* * */

(async () => {
	//

	console.log();
	console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
	console.log('> SERVICE ANALYSIS');
	const start = new Date();
	console.log('> Service Analysis started on ' + start.toISOString());

	//
	// Read input file and parse data as JSON

	console.log('• Reading input file...');

	const allPmosCsv = fs.readFileSync('pmos.csv', { encoding: 'utf8' });
	const allPmosData = Papa.parse(allPmosCsv, { header: true });

	const allStopsCsv = fs.readFileSync('paragens.csv', { encoding: 'utf8' });
	const allStopsData = Papa.parse(allStopsCsv, { header: true });

	//
	// For each PMO entry,
	// get the distance to all stops

	for (const pmoData of allPmosData.data) {
		//

		//
		// Calculate travel distance for each stop

		for (const stopData of allStopsData.data) {
			const routeOptions = await getDirectionsBetweenTwoPoints([pmoData.lon, pmoData.lat], [stopData.lon, stopData.lat]);
			console.log('routeOptions', routeOptions);
			// console.log(`• (${pmoData.id}) ${pmoData.name} > (${stopData.id}) ${stopData.name} > ${routeOptions[0].summary.distance} meters`);
			return;
		}

		//
		// 3.4.
		// Save analysis result for this location

		// const analysisResult = {
		// 	id: locationData.id,
		// 	lat: locationData.lat,
		// 	lon: locationData.lon,
		// 	name: locationData.name,
		// 	stops: Array.from(stopIdsThatServeThisLocation).join('|'),
		// };

		// serviceAnalysisResult.push(analysisResult);

		// console.log(`• (${analysisResult.id}) ${analysisResult.name} > [${analysisResult.stops}]`);

		//
	}

	//
	// 4.
	// Save analysis result to CSV table

	console.log('• Saving service analysis result to CSV file...');
	const serviceAnalysisCsv = Papa.unparse(serviceAnalysisResult, { skipEmptyLines: 'greedy' });
	fs.writeFileSync(`service_analysis_result_.csv`, serviceAnalysisCsv);
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
	const requestUrl = 'http://localhost:8080/ors/v2/directions/driving-car';

	const requestHeaders = {
		'Accept': 'application/json, application/geo+json; charset=utf-8',
		// 'Authorization': process.env.ORS_API_KEY,
		'Content-Type': 'application/json; charset=utf-8',
	};

	const requestBody = {
		// units: 'm',
		// geometry: false,
		// profile: 'driving-car',
		// elevation: false,
		// preference: 'shortest',
		coordinates: [pointA, pointB],
	};

	const directionsApiResponse = await fetch(requestUrl, { body: JSON.stringify(requestBody), headers: requestHeaders, method: 'POST' });
	const directionsApiData = await directionsApiResponse.json();

	console.log('directionsApiData', directionsApiData);

	return directionsApiData.routes?.sort((a, b) => a.summary.duration - b.summary.duration);

	//
}

function delay(miliseconds = 0) {
	return new Promise(resolve => setTimeout(resolve, miliseconds));
}
