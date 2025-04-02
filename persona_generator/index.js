import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { factorial } from './utils/factorial.js';
import categories from './categories.js';

const mappingOutputFile = 'composites_map.json';
const outputDir = './output';
const imagesBaseDir = './assets/layers';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  console.log(`Output directory not found. Creating: ${outputDir}`);
  fs.mkdirSync(outputDir);
} else {
  //Clear Mappping file
  fs.unlink('./composites_map.json', (err) => {
    if (err) throw err;
  });

  // Clear Output Directory
  fs.readdir(outputDir,(err, files) => {
    if (err) throw err;
  
    for (const file of files) {
      fs.unlink(path.join(outputDir, file), (err) => {
        if (err) throw err;
      });
    }
  });

  console.log(`Output directory exists, cleaning: ${outputDir} and mapping.json`);
}

function combinations(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}

const N = 6 * 12; 
const totalPossibilities = combinations(N, 2);

// Randomly pick one item from each category to form a composite.
// The composite id is built by joining the real _id from each selected item using '|'. ex: 1|2|3|4|5|6
function getRandomComposite() {
  const composite = {};
  // Randomly select one item per category
  for (const category of categories) {
    const items = category.items;
    const randomIndex = Math.floor(Math.random() * items.length);
    composite[category._id] = items[randomIndex];
  }
  
  const compositeIdString = categories
    .map(category => composite[category._id]._id)
    .join('|');
  return { composite, compositeIdString };
}

async function generateCompositesMappingAndImages() {
  const compositesMapping = [];
  const composites = [];
  for (let i = 0; i < totalPossibilities; i++) {
    const compositeData = getRandomComposite();
    compositesMapping.push({
      id: compositeData.compositeIdString,
      url: compositeData.compositeIdString + ".png"
    });
    composites.push(compositeData);
  }
  
  fs.writeFileSync(mappingOutputFile, JSON.stringify(compositesMapping, null, 2));
  console.log(`Composite mapping written to ${mappingOutputFile}`);
  await processComposites(composites);
}

async function processComposites(composites) {
  try {
    for (const { composite, compositeIdString } of composites) {
      console.log(`Processing composite: ${compositeIdString}`);

      // Create a blank 1000x1000 image with a transparent background
      let baseImage = sharp({
        create: {
          width: 1000,
          height: 1000,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      });

      const compositeLayers = [];
      // For each category, process the selected item's images
      for (const category of categories) {
        const catId = category._id;
        const selectedItem = composite[catId];
        if (!selectedItem) continue;

        for (const imageData of selectedItem.images) {
          let imagePath;
          if (catId === 'Base') {
            // For Base, the image is a loose file in imagesBaseDir
            imagePath = path.join(imagesBaseDir, imageData.filename);
          } else {
            // For other categories, the image is inside a folder named exactly as the category id
            imagePath = path.join(imagesBaseDir, catId, imageData.filename);
          }

          // If the image does not exist, attempt fallback using the first image of the item
          if (!fs.existsSync(imagePath)) {
            console.warn(`Image not found: ${imagePath}. Attempting fallback.`);
            if (selectedItem.images.length > 0) {
              const fallbackImage = selectedItem.images[0];
              if (catId === 'Base') {
                imagePath = path.join(imagesBaseDir, fallbackImage.filename);
              } else {
                imagePath = path.join(imagesBaseDir, catId, fallbackImage.filename);
              }
            }
            if (!fs.existsSync(imagePath)) {
              console.error(`Fallback image also not found for category ${catId}. Skipping.`);
              continue;
            }
          }

          try {
            const layerBuffer = await sharp(imagePath)
              .resize(1000, 1000, { fit: 'contain' })
              .toBuffer();
            // Add this layer to the composite layers array with its order
            compositeLayers.push({
              input: layerBuffer,
              top: 0,
              left: 0,
              order: imageData.order,
            });
          } catch (error) {
            console.error(`Error processing image ${imagePath}:`, error);
          }
        }
      }

      // Sort compositeLayers by the 'order' property
      compositeLayers.sort((a, b) => a.order - b.order);

      // Remove the 'order' property as it's not needed for the composite operation
      const layersToComposite = compositeLayers.map(({ input, top, left }) => ({
        input,
        top,
        left,
      }));

      console.log(`Compositing ${layersToComposite.length} layers for composite: ${compositeIdString}`);
      baseImage = baseImage.composite(layersToComposite);

      // Build the output file path using the composite id
      const outputFilePath = path.join(outputDir, `${compositeIdString}.png`);
      // Ensure the directory exists
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

      console.log(`Writing composite image to: ${outputFilePath}`);
      await baseImage.png().toFile(outputFilePath);
      console.log(`Composite image created: ${outputFilePath}`);
    }
  } catch (err) {
    console.error('Error processing composite definitions:', err);
  }
}

console.log("Script started.");
generateCompositesMappingAndImages();
console.log("Script finished.");
