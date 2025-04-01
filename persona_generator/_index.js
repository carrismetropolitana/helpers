const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Using Sharp instead of Jimp

const outputFile = 'ids_sample.txt';

const imagesBaseDir = './assets/layers';
const outputDir = './output';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  console.log(`Output directory not found. Creating: ${outputDir}`);
  fs.mkdirSync(outputDir);
} else {
  console.log(`Output directory exists: ${outputDir}`);
}


function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
      result *= i;
  }
  return result;
}

function combinations(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}


const N = 6 * 12; 
const totalIds = combinations(N, 2);

// Function to generate a random ID in the format 1_1_1_1_1_1_1
function getRandomId() {
  const parts = [];
  for (let i = 0; i < 7; i++) {
    const randomNumber = Math.floor(Math.random() * 12) + 1;
    parts.push(randomNumber);
  }
  const id = parts.join('_');
  console.log(`Generated ID: ${id}`);
  return id;
}

// Function to generate IDs and write them to a file
async function generateIds() {
  console.log("Starting ID generation...");
  const stream = fs.createWriteStream(outputFile, { flags: 'w' });

  for (let i = 0; i < totalIds; i++) {
    const id = getRandomId();
    console.log(`Writing ID ${i + 1}: ${id}`);
    stream.write(id + '\n');
  }

  // Use the 'finish' event to know when writing is complete
  stream.on('finish', async () => {
    console.log(`Sample file generation complete! ${totalIds} IDs written to ${outputFile}`);
    console.log("Starting image processing...");
    await processIds();
  });

  stream.end();
}

// Function to process IDs and create composite images using Sharp
async function processIds() {
  try {
    console.log(`Reading IDs from file: ${outputFile}`);
    const data = fs.readFileSync(outputFile, 'utf8');
    const ids = data.trim().split('\n');
    console.log(`Found ${ids.length} ID(s) in file`);

    for (const [index, id] of ids.entries()) {
      console.log(`Processing ID ${index + 1}: ${id}`);
      const parts = id.split('_');
      
      // Create a blank 1000x1000 image with a transparent background
      let baseImage = sharp({
        create: {
          width: 1000,
          height: 1000,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      });

      const compositeLayers = [];

      for (const [layerIndex, imageNumber] of parts.entries()) {
        const layer = layerIndex + 1;
        let imagePath = path.join(imagesBaseDir, `${layer}`, `${imageNumber}.png`);
        console.log(`Layer ${layer}: Checking image path: ${imagePath}`);

        // Check if the image exists; if not, use fallback
        if (!fs.existsSync(imagePath)) {
          console.warn(`Layer ${layer}: Image not found: ${imagePath}. Using fallback image.`);
          imagePath = path.join(imagesBaseDir, `${layer}`, `1.png`);
          if (!fs.existsSync(imagePath)) {
            console.error(`Layer ${layer}: Fallback image not found: ${imagePath}. Skipping this layer.`);
            continue;
          }
        }

        try {
          console.log(`Layer ${layer}: Reading image: ${imagePath}`);
          // Resize image to base dimensions (1000x1000) before compositing
          console.log(`Layer ${layer}: Resizing image to 1000x1000.`);
          const layerBuffer = await sharp(imagePath)
            .resize(1000, 1000, { fit: 'contain' })
            .toBuffer();
          console.log(`Layer ${layer}: Adding image to composite layers.`);
          compositeLayers.push({
            input: layerBuffer,
            top: 0,
            left: 0
          });
        } catch (error) {
          console.error(`Layer ${layer}: Error processing image ${imagePath}:`, error);
        }
      }

      console.log(`Compositing layers for composite image ${index + 1}.`);
      // Composite all layers onto the base image
      baseImage = baseImage.composite(compositeLayers);

      const outputFilePath = path.join(outputDir, `composite_${index + 1}.png`);
      console.log(`Writing composite image to: ${outputFilePath}`);
      await baseImage.png().toFile(outputFilePath);
      console.log(`Composite image created: ${outputFilePath}`);
    }
  } catch (err) {
    console.error('Error reading IDs file:', err);
  }
}

// Start the process
console.log("Script started.");
generateIds();
