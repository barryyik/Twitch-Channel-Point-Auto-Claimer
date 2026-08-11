// scripts/build-content.js
// Generates content.js by injecting shared util modules into the template

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const templatePath = resolve(__dirname, '../src/content/content.template.js');
const outputPath = resolve(__dirname, '../src/content/content.js');

const modules = [
  {
    placeholder: '{{CHANNEL_PARSER}}',
    path: resolve(__dirname, '../src/utils/channel-parser.js'),
    label: 'channel-parser.js'
  },
  {
    placeholder: '{{CLAIM_BUTTON}}',
    path: resolve(__dirname, '../src/utils/claim-button.js'),
    label: 'claim-button.js'
  },
  {
    placeholder: '{{CLAIM_GUARD}}',
    path: resolve(__dirname, '../src/utils/claim-guard.js'),
    label: 'claim-guard.js'
  }
];

console.log('Building content.js from template...');

if (!existsSync(templatePath)) {
  console.error('Template file not found:', templatePath);
  process.exit(1);
}

function stripExports(code) {
  return code
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+\{[^}]+\};?/g, '')
    .trim();
}

let template = readFileSync(templatePath, 'utf-8');

for (const mod of modules) {
  if (!existsSync(mod.path)) {
    console.error('Module not found:', mod.path);
    process.exit(1);
  }
  if (!template.includes(mod.placeholder)) {
    console.error(`Placeholder ${mod.placeholder} missing from template`);
    process.exit(1);
  }

  const raw = readFileSync(mod.path, 'utf-8');
  const injected = `
// --- auto-generated from utils/${mod.label} ---
${stripExports(raw)}
`;
  template = template.replace(mod.placeholder, injected);
  console.log(`Injected ${mod.label}`);
}

writeFileSync(outputPath, template, 'utf-8');
console.log('Content script generated:', outputPath);
