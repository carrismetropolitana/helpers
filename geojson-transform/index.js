/* * */

import * as turf from '@turf/turf';
import fs from 'node:fs';
import path from 'path';
import yazl from 'yazl';

/* * */

const formatFeatures = async () => {
	//

	console.log('• Parsing districts...');

	const districtsText = fs.readFileSync('districts.json', { encoding: 'utf8' });
	const districtsData = JSON.parse(districtsText);

	for (const districtFeature of districtsData.features) {
		//

		districtFeature.id = districtFeature.properties.id;

		districtFeature.properties['area_ha'] = districtFeature.properties['Area_ha'];

		delete districtFeature.properties['Area_ha'];
		delete districtFeature.properties['Perim_km'];
		delete districtFeature.properties['Shape_Length'];
		delete districtFeature.properties['Shape_Area'];
		delete districtFeature.properties['OBJECTID'];

		//
	}

	fs.writeFileSync(`districts_parsed.json`, JSON.stringify(districtsData));

	const districtsZip = new yazl.ZipFile();
	await new Promise((resolve) => {
		districtsZip.addFile(path.resolve(`./districts_parsed.json`), 'districts.json', { compressionLevel: 9 });
		districtsZip.outputStream.pipe(fs.createWriteStream(path.resolve(`./districts.zip`))).on('close', () => resolve());
		districtsZip.end();
	});

	/* * */

	console.log('• Parsing municipalities...');

	const municipalitiesText = fs.readFileSync('municipalities.json', { encoding: 'utf8' });
	const municipalitiesData = JSON.parse(municipalitiesText);

	for (const municipalityFeature of municipalitiesData.features) {
		//

		municipalityFeature.id = municipalityFeature.properties.id;

		municipalityFeature.properties['district_id'] = municipalityFeature.properties.id.substring(0, 2);
		municipalityFeature.properties['area_ha'] = municipalityFeature.properties['Area_ha'];

		delete municipalityFeature.properties['Area_ha'];
		delete municipalityFeature.properties['Perim_km'];
		delete municipalityFeature.properties['Shape_Length'];
		delete municipalityFeature.properties['Shape_Area'];
		delete municipalityFeature.properties['OBJECTID'];

		//
	}

	fs.writeFileSync(`municipalities_parsed.json`, JSON.stringify(municipalitiesData));

	const municipalitiesZip = new yazl.ZipFile();
	await new Promise((resolve) => {
		municipalitiesZip.addFile(path.resolve(`./municipalities_parsed.json`), 'municipalities.json', { compressionLevel: 9 });
		municipalitiesZip.outputStream.pipe(fs.createWriteStream(path.resolve(`./municipalities.zip`))).on('close', () => resolve());
		municipalitiesZip.end();
	});

	/* * */

	console.log('• Parsing parishes...');

	const parishesText = fs.readFileSync('parishes.json', { encoding: 'utf8' });
	const parishesData = JSON.parse(parishesText);

	for (const parishFeature of parishesData.features) {
		//

		parishFeature.id = parishFeature.properties.id;

		parishFeature.properties['district_id'] = parishFeature.properties.id.substring(0, 2);
		parishFeature.properties['municipality_id'] = parishFeature.properties.id.substring(0, 4);
		parishFeature.properties['area_ha'] = parishFeature.properties['Area_ha'];

		delete parishFeature.properties['Area_ha'];
		delete parishFeature.properties['Perim_km'];
		delete parishFeature.properties['Shape_Length'];
		delete parishFeature.properties['Shape_Area'];
		delete parishFeature.properties['OBJECTID'];

		//
	}

	fs.writeFileSync(`parishes_parsed.json`, JSON.stringify(parishesData));

	const parishesZip = new yazl.ZipFile();
	await new Promise((resolve) => {
		parishesZip.addFile(path.resolve(`./parishes_parsed.json`), 'parishes.json', { compressionLevel: 9 });
		parishesZip.outputStream.pipe(fs.createWriteStream(path.resolve(`./parishes.zip`))).on('close', () => resolve());
		parishesZip.end();
	});

	/* * */

	console.log('• Parsing localities...');

	const localitiesText = fs.readFileSync('localities.json', { encoding: 'utf8' });
	const localitiesData = JSON.parse(localitiesText);

	for (const localityFeature of localitiesData.features) {
		//
		try {
			//

			if (localityFeature.properties['LUG11'] === '999999') {
				console.log('skipped 999999');
				continue;
			}

			localityFeature.id = localityFeature.properties['LUG11'];
			localityFeature.properties['id'] = localityFeature.properties['LUG11'];

			localityFeature.properties['name'] = localityFeature.properties['FIRST_LUG11DESIG'];
			localityFeature.properties['district_id'] = `${localityFeature.properties['FIRST_DICOFRE']}`.padStart(6, '0').substring(0, 2);
			localityFeature.properties['municipality_id'] = `${localityFeature.properties['FIRST_DICOFRE']}`.padStart(6, '0').substring(0, 4);
			localityFeature.properties['parish_id'] = `${localityFeature.properties['FIRST_DICOFRE']}`.padStart(6, '0');

			delete localityFeature.properties['OBJECTID'];
			delete localityFeature.properties['LUG11'];
			delete localityFeature.properties['FIRST_DICOFRE'];
			delete localityFeature.properties['FIRST_LUG11DESIG'];
			delete localityFeature.properties['Shape_Length'];
			delete localityFeature.properties['Shape_Area'];

			localityFeature.geometry = turf.cleanCoords(localityFeature.geometry, { mutate: true });
			localityFeature.geometry = turf.simplify(localityFeature.geometry, { highQuality: true, mutate: true, tolerance: 0.00001 });
		}
		catch (error) {
			console.log(error);
			console.log(localityFeature);
		}

		//
	}

	fs.writeFileSync(`localities_parsed.json`, JSON.stringify(localitiesData));

	const localitiesZip = new yazl.ZipFile();
	await new Promise((resolve) => {
		localitiesZip.addFile(path.resolve(`./localities_parsed.json`), 'localities.json', { compressionLevel: 9 });
		localitiesZip.outputStream.pipe(fs.createWriteStream(path.resolve(`./localities.zip`))).on('close', () => resolve());
		localitiesZip.end();
	});

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
