const fs = require('fs');
const path = require('path');

// Path to your header image
const imagePath = path.join(__dirname, '..', 'assets', 'images', 'magnum_header.png');

try {
  // Read the image file
  const imageBuffer = fs.readFileSync(imagePath);
  
  // Convert to base64
  const base64String = imageBuffer.toString('base64');
  
  // Create the data URI
  const dataUri = `data:image/png;base64,${base64String}`;
  
  console.log('Base64 Data URI generated successfully!');
  console.log('Length:', dataUri.length);
  console.log('First 100 characters:', dataUri.substring(0, 100));
  
  // Write to a file as a module export
  const outputPath = path.join(__dirname, 'headerImageBase64.txt');
  fs.writeFileSync(outputPath, `module.exports = '${dataUri}';`);
  
  console.log(`\nBase64 data URI saved as module to: ${outputPath}`);
  console.log('\nThe base64 string is now available as a require-able module.');
  
} catch (error) {
  console.error('Error generating base64:', error);
}