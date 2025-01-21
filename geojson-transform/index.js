/* * */

const fs = require('fs');

/* * */

const formatFeatures = async () => {
  //

  console.log('• Parsing districts...');

  const districtsText = fs.readFileSync('districts.json', { encoding: 'utf8' });
  const districtsData = JSON.parse(districtsText);

  for (const districtFeature of districtsData.features) {
    //

	districtFeature.id = districtFeature.properties.id;

	districtFeature.properties.area_ha = districtFeature.properties.Area_ha;
	delete districtFeature.properties.Area_ha;

	delete districtFeature.properties.id;
	delete districtFeature.properties.Perim_km;
	delete districtFeature.properties.Shape_Length;
	delete districtFeature.properties.Shape_Area;
	delete districtFeature.properties.OBJECTID;

    //
  }

  fs.writeFileSync(`districts_parsed.json`, JSON.stringify(districtsData, null, 2));


  /* * */

  console.log('• Parsing municipalities...');

  const municipalitiesText = fs.readFileSync('municipalities.json', { encoding: 'utf8' });
  const municipalitiesData = JSON.parse(municipalitiesText);

  for (const municipalityFeature of municipalitiesData.features) {
    //

	municipalityFeature.id = municipalityFeature.properties.id;

	municipalityFeature.properties.area_ha = municipalityFeature.properties.Area_ha;
	delete municipalityFeature.properties.Area_ha;

	delete municipalityFeature.properties.id;
	delete municipalityFeature.properties.Perim_km;
	delete municipalityFeature.properties.Shape_Length;
	delete municipalityFeature.properties.Shape_Area;
	delete municipalityFeature.properties.OBJECTID;

    //
  }

  fs.writeFileSync(`municipalities_parsed.json`, JSON.stringify(municipalitiesData, null, 2));

   /* * */

   console.log('• Parsing parishes...');

   const parishesText = fs.readFileSync('parishes.json', { encoding: 'utf8' });
   const parishesData = JSON.parse(parishesText);

   for (const parishFeature of parishesData.features) {
	 //

	 parishFeature.id = parishFeature.properties.id;

	 parishFeature.properties.area_ha = parishFeature.properties.Area_ha;
	 delete parishFeature.properties.Area_ha;

	 delete parishFeature.properties.id;
	 delete parishFeature.properties.Perim_km;
	 delete parishFeature.properties.Shape_Length;
	 delete parishFeature.properties.Shape_Area;
	 delete parishFeature.properties.OBJECTID;

	 //
   }

   fs.writeFileSync(`parishes_parsed.json`, JSON.stringify(parishesData, null, 2));

  //

  console.log('• Done!');
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
  /* */ await formatFeatures();
  /* * * * * * * * * * * * */

  const syncDuration = new Date() - start;
  console.log('> Operation took ' + syncDuration / 1000 + ' seconds.');
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  console.log();
})();
