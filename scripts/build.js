// scripts/build.js
import { existsSync, mkdirSync, copyFileSync, readdirSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get browser target
const args = process.argv.slice(2);
const browserTarget = args[0] || process.env.BROWSER || 'chrome';
const isWatch = args.includes('--watch');

console.log(`🔨 Building for ${browserTarget}...`);

// Paths
const srcDir = resolve(__dirname, '../src');
const publicDir = resolve(__dirname, '../public');
const distDir = resolve(__dirname, `../dist-${browserTarget}`);

// Clean dist directory
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}
mkdirSync(distDir, { recursive: true });

// 1. Copy manifest
const manifestSrc = resolve(srcDir, `manifest.${browserTarget}.json`);
const manifestDest = resolve(distDir, 'manifest.json');
if (existsSync(manifestSrc)) {
  copyFileSync(manifestSrc, manifestDest);
  console.log('✓ Copied manifest');
} else {
  console.error(`❌ Manifest not found: ${manifestSrc}`);
  process.exit(1);
}

// 2. Copy locales
const localesSrc = resolve(srcDir, '_locales');
const localesDest = resolve(distDir, '_locales');
if (existsSync(localesSrc)) {
  copyRecursive(localesSrc, localesDest);
  console.log('✓ Copied locales');
}

// 3. Copy background
const backgroundSrc = resolve(srcDir, 'background/background.js');
const backgroundDest = resolve(distDir, 'background.js');
if (existsSync(backgroundSrc)) {
  copyFileSync(backgroundSrc, backgroundDest);
  console.log('✓ Copied background script');
}

// 4. Copy content script (generated)
const contentSrc = resolve(srcDir, 'content/content.js');
const contentDest = resolve(distDir, 'content.js');
if (existsSync(contentSrc)) {
  copyFileSync(contentSrc, contentDest);
  console.log('✓ Copied content script');
} else {
  console.error('❌ content.js not found. Run build-content.js first.');
  process.exit(1);
}

// 5. Copy images
const imagesSrc = resolve(publicDir, 'images');
const imagesDest = resolve(distDir, 'images');
if (existsSync(imagesSrc)) {
  copyRecursive(imagesSrc, imagesDest);
  console.log('✓ Copied images');
}

// 6. Build popup with Vite
console.log(`\n📦 Building popup with Vite...`);
try {
  // Vite will output to the same dist directory
  const viteCmd = `bun run vite build --outDir ${distDir} --emptyOutDir false`;
  execSync(viteCmd, { 
    stdio: 'inherit',
    env: { ...process.env, BROWSER: browserTarget }
  });
  console.log('✓ Popup built');
} catch (error) {
  console.error('❌ Vite build failed:', error.message);
  process.exit(1);
}

console.log(`\n✅ Build complete for ${browserTarget}!`);
console.log(`📁 Output: ${distDir}`);

// Helper function to copy directories recursively
function copyRecursive(src, dest) {
  if (!existsSync(src)) return;
  
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}