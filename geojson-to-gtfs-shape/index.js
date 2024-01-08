/* * */

const fs = require('fs');
const turf = require('@turf/turf');
const Papa = require('papaparse');

/* * */

const start = async () => {
  //

  //
  // 0. Get latest data from Intermodal

  const txtData = fs.readFileSync('mts.geojson', { encoding: 'utf8' });
  const geojsonData = JSON.parse(txtData);

  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
  const sortedGeojsonData = geojsonData.features.sort((a, b) => collator.compare(a.properties?.pattern_id, b.properties?.pattern_id));

  let allShapesData = [];

  //   let unionResult = geojsonData.features.pop();
  for (const feature of sortedGeojsonData) {
    //

    const patternId = feature.properties?.pattern_id;

    //

    let cumulativeDistance = 0;

    // Setup the first point for the shape
    allShapesData.push({
      shape_id: `shp_${patternId}`,
      shape_pt_lat: feature.geometry?.coordinates[0][1].toFixed(6),
      shape_pt_lon: feature.geometry?.coordinates[0][0].toFixed(6),
      shape_pt_sequence: 0,
      shape_dist_traveled: 0,
    });

    for (let index = 1; index < feature.geometry?.coordinates.length; index++) {
      // Calculate distance for this segment
      const pointA = turf.point(feature.geometry?.coordinates[index - 1]);
      const pointB = turf.point(feature.geometry?.coordinates[index]);
      const segmentDistance = turf.distance(pointA, pointB, { units: 'kilometers' }) * 1000;
      // Add the distance to cumulative
      cumulativeDistance += segmentDistance;
      // Prepare the column entry for this shape point
      allShapesData.push({
        shape_id: `shp_${patternId}`,
        shape_pt_lat: pointB.geometry.coordinates[1].toFixed(6),
        shape_pt_lon: pointB.geometry.coordinates[0].toFixed(6),
        shape_pt_sequence: index,
        shape_dist_traveled: cumulativeDistance.toFixed(15),
      });
      //
    }

    //
  }

  const allShapesTxtData = Papa.unparse(allShapesData);
  fs.writeFileSync(`shapes.csv`, allShapesTxtData);

  //

  console.log('• Done!');
};

/* * */

(async () => {
  console.log();
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  const startDate = new Date();
  console.log('> Operation started on ' + startDate.toISOString());

  /* * * * * * * * * * * * */
  /* */ await start();
  /* * * * * * * * * * * * */

  const operationDuration = new Date() - startDate;
  console.log('> Operation took ' + operationDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();
