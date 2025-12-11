/* * */

import * as turf from '@turf/turf';
import fs from 'fs';
import Papa from 'papaparse';

/* * */

(() => {
	//

	//
	// 0. Get latest data from Intermodal

	const txtData = fs.readFileSync('./input/linha_verde.geojson', { encoding: 'utf8' });
	const geojsonData = JSON.parse(txtData);

	let allShapesData = [];

	//   let unionResult = geojsonData.features.pop();
	for (const feature of geojsonData.features) {
		//

		const patternId = 'verde-rev';

		let cumulativeDistance = 0;

		// Invert loop to calculate distances
		feature.geometry.coordinates.reverse();

		// Setup the first point for the shape
		allShapesData.push({
			shape_dist_traveled: 0,
			shape_id: `shp_${patternId}`,
			shape_pt_lat: feature.geometry?.coordinates[0][1].toFixed(6),
			shape_pt_lon: feature.geometry?.coordinates[0][0].toFixed(6),
			shape_pt_sequence: 0,
		});

		for (let index = 1; index < feature.geometry?.coordinates.length; index++) {
			// Calculate distance for this segment
			const pointA = turf.point(feature.geometry?.coordinates[index - 1]);
			const pointB = turf.point(feature.geometry?.coordinates[index]);
			const segmentDistance = turf.distance(pointA, pointB, { units: 'meters' });
			// Add the distance to cumulative
			cumulativeDistance += segmentDistance;
			// Prepare the column entry for this shape point
			allShapesData.push({
				shape_dist_traveled: cumulativeDistance.toFixed(15),
				shape_id: `shp_${patternId}`,
				shape_pt_lat: pointB.geometry.coordinates[1].toFixed(6),
				shape_pt_lon: pointB.geometry.coordinates[0].toFixed(6),
				shape_pt_sequence: index,
			});
			//
		}

		const allShapesTxtData = Papa.unparse(allShapesData);
		if (!fs.existsSync('./output')) fs.mkdirSync('./output');
		fs.writeFileSync(`./output/shp_${patternId}.csv`, allShapesTxtData);
		allShapesData = [];

		//
	}

	//

	console.log('• Done!');
})();
