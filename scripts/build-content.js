// scripts/build-content.js
// This script generates the content.js file by injecting the parser code

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const templatePath = resolve(__dirname, '../src/content/content.template.js');
const parserPath = resolve(__dirname, '../src/utils/channel-parser.js');
const outputPath = resolve(__dirname, '../src/content/content.js');

console.log('🔨 Building content.js from template...');

// Check if template exists
if (!existsSync(templatePath)) {
  console.error('❌ Template file not found:', templatePath);
  process.exit(1);
}

// Check if parser exists
if (!existsSync(parserPath)) {
  console.error('❌ Parser file not found:', parserPath);
  process.exit(1);
}

// Read template
let template = readFileSync(templatePath, 'utf-8');

// Read parser code (extract the function, removing export)
let parserCode = readFileSync(parserPath, 'utf-8');

// Remove the export statement and keep only the function
parserCode = parserCode
  .replace(/export\s+function\s+/, 'function ')
  .replace(/export\s+{\s*getChannelNameFromUrl\s*};?/, '')
  .trim();

// Wrap parser code to ensure it's properly defined
parserCode = `
// Channel parser function (auto-generated from utils/channel-parser.js)
${parserCode}
`;

// Replace placeholder with parser code
const generatedContent = template.replace('{{CHANNEL_PARSER}}', parserCode);

// Write the generated content
writeFileSync(outputPath, generatedContent, 'utf-8');

console.log('✅ Content script generated successfully:', outputPath);
console.log('📝 Generated from template and shared parser');