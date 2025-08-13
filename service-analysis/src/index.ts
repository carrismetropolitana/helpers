/* * */

import fs from 'fs';
import Papa from 'papaparse';

/* * */

interface Pmo {
	id: string
	lat: number
	lon: number
}

interface Stop {
	id: string
	lat: number
	lon: number
}

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
	const allPmosData = Papa.parse<Pmo>(allPmosCsv, { header: true });

	const allStopsCsv = fs.readFileSync('paragens.csv', { encoding: 'utf8' });
	const allStopsData = Papa.parse<Stop>(allStopsCsv, { header: true });

	//
	// For each PMO entry,
	// get the distance to all stops

	for (const pmoData of allPmosData.data) {
		//

		console.log('• Processing PMO ' + pmoData.id + '...');

		const pmoResult = [];

		//
		// Calculate travel distance for each stop

		for (const stopData of allStopsData.data) {
			const routeOptions = await getDirectionsBetweenTwoPoints([pmoData.lon, pmoData.lat], [stopData.lon, stopData.lat]);
			if (routeOptions.length === 0) continue;
			pmoResult.push({
				distance: routeOptions[0].summary.distance,
				duration: routeOptions[0].summary.duration,
				pmo_id: pmoData.id,
				stop_id: stopData.id,
			});
		}

		//
		// Save analysis result for this PMO

		console.log('• Saving pmoResult to CSV file...');
		const pmoResultCsv = Papa.unparse(pmoResult, { skipEmptyLines: 'greedy' });
		fs.writeFileSync(`pmoResult_${pmoData.id}.csv`, pmoResultCsv);
		console.log('• Done! Updated ' + pmoResult.length + ' records.');

		//
	}

	// const syncDuration = new Date() - start;
	// console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
	console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
	console.log();

	//
})();

/* * */

interface OrsResponse {
	routes: {
		summary: {
			distance: number // in meters
			duration: number // in seconds
		}
	}[]
}

async function getDirectionsBetweenTwoPoints(pointA, pointB): Promise<OrsResponse['routes']> {
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
		units: 'm',
		// geometry: false,
		profile: 'driving-car',
		// elevation: false,
		// preference: 'shortest',
		coordinates: [pointA, pointB],
	};

	const directionsApiResponse = await fetch(requestUrl, { body: JSON.stringify(requestBody), headers: requestHeaders, method: 'POST' });
	const directionsApiData = await directionsApiResponse.json() as OrsResponse;

	return directionsApiData.routes?.sort((a, b) => a.summary.distance - b.summary.distance) ?? [];

	//
}

function delay(miliseconds = 0) {
	return new Promise(resolve => setTimeout(resolve, miliseconds));
}
