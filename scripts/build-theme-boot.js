// scripts/build-theme-boot.js
// Generates theme-boot.js from template + accent-presets.js

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ACCENT_PRESETS, DEFAULT_ACCENT } from '../src/popup/accent-presets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const templatePath = resolve(__dirname, '../src/popup/theme-boot.template.js');
const outputPath = resolve(__dirname, '../src/popup/theme-boot.js');

console.log('Building theme-boot.js from template...');

if (!existsSync(templatePath)) {
  console.error('Template file not found:', templatePath);
  process.exit(1);
}

const accentIds = ACCENT_PRESETS.map((preset) => preset.id);
const validMap = Object.fromEntries(accentIds.map((id) => [id, 1]));

let template = readFileSync(templatePath, 'utf-8');
template = template.replaceAll('{{DEFAULT_ACCENT}}', DEFAULT_ACCENT);
template = template.replace('{{ACCENT_IDS_JSON}}', JSON.stringify(validMap));

writeFileSync(outputPath, template, 'utf-8');
console.log('Theme boot script generated:', outputPath);
