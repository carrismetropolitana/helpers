/* * */

import fs from 'fs';
import Papa from 'papaparse';
import puppeteer from 'puppeteer';

/* * */

const OUTPUT_DIRECTORY = '../output';
const RENDERER_URL = 'http://localhost:3006';

/* * */

interface JobData {
	id: string
	render_path: string
}

/* * */

(async function init() {
	//

	const allJobsCsv = Papa.parse(fs.readFileSync('./jobs-fallback.csv', { encoding: 'utf-8' }), { header: true });
	const allJobsData = allJobsCsv.data as JobData[];

	// Setup browser instance on init
	const BROWSER_INSTANCE = await puppeteer.launch({
		headless: true,
		// executablePath: 'google-chrome-stable',
		args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
		defaultViewport: {
			height: 1440,
			width: 2560,
		},
	});

	// Initiate a new page on the browser
	const browserPage = await BROWSER_INSTANCE.newPage();

	for (const jobData of allJobsData) {
		//

		// Create an empty directory in the given path if it does not yet exists
		if (!fs.existsSync(OUTPUT_DIRECTORY)) fs.mkdirSync(OUTPUT_DIRECTORY);

		try {
			//

			// Build the complete URL to be rendered
			const completeUrl = `${RENDERER_URL}${jobData.render_path}`;

			// Navigate to the URL
			await browserPage.goto(completeUrl, { timeout: 5000, waitUntil: 'networkidle0' });

			// Set media-type to reflect CSS used for screens instead of print
			await browserPage.emulateMediaType('screen');

			// Print the PDF
			const pngData = await browserPage.screenshot({
				captureBeyondViewport: false,
				clip: {
					height: 1440,
					width: 2560,
					x: 0,
					y: 0,
				},
				type: 'png',
			});

			// Save the PDF to the shared volume on disk
			fs.writeFileSync(`${OUTPUT_DIRECTORY}/${jobData.id}.png`, pngData);

			// Log progress
			console.log(`→ code: ${jobData.id}`);

			//
		}
		catch (err) {
			console.log('🔴 → Error printing "%s"', `${RENDERER_URL}${jobData.render_path}`, err);
		}

		//
	}

	// Close the page
	await browserPage.close();

	await BROWSER_INSTANCE.close();

	// Log elapsed time for the current operation
	console.log(`→ Task completed: Worked on ${allJobsData.length} jobs.`);
	console.log(`------------------------------------------------------------------------`);
	console.log();

	//
})();
