console.log(" Script started...");

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const IMAGE_DIR = path.join(__dirname, "fallbacks"); // Folder containing fallback images
const API_URL = process.env.PIP_URL; // Panel API base
const MAX_PANEL_ID = 700;

async function updateImage(panel, id) {
  if (!panel || !panel.baseInformation || !panel.operation) {
    console.warn(`Panel ${id} is missing required fields, skipping.`);
    return;
  }

  const file = path.join(IMAGE_DIR, `${id}.png`);
  if (!fs.existsSync(file)) {
    console.warn(`No fallback image found for panel ${id}, skipping.`);
    return;
  }

  const ext = path.extname(file);
  const short = path.basename(file, ext);

  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  const imageData = fs.readFileSync(file, "base64");
  const base64Image = `data:${mime};base64,${imageData}`;
  console.log(`Updating panel ${id} with fallback image...`);
  try {
    await axios.put(`${API_URL}/${id}`, {
      ...panel,
      operation: {
        ...panel.operation,
        fallbackImage: base64Image
      }
    });
    console.log(`✅ Panel ${id} updated successfully.`);
  } catch (err) {
    console.warn(`❌ Failed to update panel ${id}: ${err.message}`);
  }
}


async function main() {
  // Step 1: Fetch all panels once
  console.log("Fetching all panels...");
  const panels = [];

  for (let id = 100; id <= MAX_PANEL_ID; id++) {
    try {
      const { data: panel } = await axios.get(`${API_URL}/${id}`);

      if(!panel || !panel.baseInformation || !panel.operation) {
        console.warn(`Panel ${id} is missing required fields, skipping.`);
        continue;
      }

      updateImage(panel, id);
    } catch (err) {
      console.warn(`Failed to fetch panel ${id}: ${err.message}`);
    }
  }

  console.log(" All fallback images processed and updated.");
}

main().catch(err => console.error(" Script error:", err));
