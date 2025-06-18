/* * */

import fs from 'fs';
import Papa from 'papaparse';
import QRCode from 'qrcode';

/* * */

const CONFIGS = {

	destination_path: '/Users/joao/Developer/carrismetropolitana/helpers/qrcode-generator/output',

};

/* * */

interface CsvRow {
	id: string
	url: string
}

/* * */

const generateQRCodes = async () => {
	try {
		const csvFilePath = '/Users/joao/Developer/carrismetropolitana/helpers/qrcode-generator/input.csv';
		const csvFile = fs.readFileSync(csvFilePath, 'utf8');
		const parsedData = Papa.parse(csvFile, { header: true, skipEmptyLines: true });
		const allData: CsvRow[] = parsedData.data as CsvRow[];

		if (fs.existsSync(CONFIGS.destination_path)) {
			fs.rmSync(CONFIGS.destination_path, { recursive: true });
		}
		fs.mkdirSync(CONFIGS.destination_path, { recursive: true });

		for (const row of allData) {
			const filePath = CONFIGS.destination_path + '/' + row.id + '.png';
			await QRCode.toFile(filePath, row.url, { errorCorrectionLevel: 'H', margin: 0, width: 750 });
			console.log(`QR Code generated for ID: ${row.id} at ${filePath}`);
		}
	}
	catch (err) {
		console.error(err);
	}
};

/* * */

(() => {
	generateQRCodes();
})();
