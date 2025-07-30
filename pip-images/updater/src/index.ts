/* * */

import fs from 'fs';

/* * */

const LIST_ALL_PANELS_URL = process.env.LIST_ALL_PANELS_URL ?? '';
const SINGLE_PANEL_URL = process.env.SINGLE_PANEL_URL ?? '';

/* * */

interface PanelDetail {
	baseInformation: {
		identifier: string
	}
	id: string
	name: string
	operation: {
		fallbackImage: string
	}
}

interface PanelSummary {
	id: number
	name: string
}

/* * */

(async function init() {
	//

	const allPanelsRes = await fetch(LIST_ALL_PANELS_URL);
	const allPanelsData = await allPanelsRes.json() as PanelSummary[];

	for (const panelData of allPanelsData) {
		try {
			//

			const singlePanelRes = await fetch(`${SINGLE_PANEL_URL}/${panelData.id}`);
			const singlePanelData = await singlePanelRes.json() as PanelDetail;

			const panelIdentifier = singlePanelData.baseInformation.identifier;

			const fallbackImageData = fs.readFileSync(`./images/${panelIdentifier}.png`, 'base64');
			const base64ImageData = `data:image/png;base64,${fallbackImageData}`;

			const updatePanelRes = await fetch(`${SINGLE_PANEL_URL}/${panelData.id}`, {
				body: JSON.stringify({
					...singlePanelData,
					operation: {
						...singlePanelData.operation,
						fallbackImage: base64ImageData,
					},
				}),
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'PUT',
			});

			if (!updatePanelRes.ok) {
				console.error(`Failed to update panel ${panelData.id}:`, await updatePanelRes.text());
				continue;
			}

			console.log(`Updated panel ${panelData.id} with identifier ${panelIdentifier}.`);

		//
		}
		catch (error) {
			console.error(`Error processing panel ${panelData.id}:`, error);
			continue;
		}
	}

	// Log elapsed time for the current operation
	console.log(`→ Task completed: Worked on ${allPanelsData.length} jobs.`);
	console.log(`------------------------------------------------------------------------`);
	console.log();

	//
})();
