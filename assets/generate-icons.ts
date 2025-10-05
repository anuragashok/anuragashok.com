#!/usr/bin/env tsx

/**
 * 🎨 Comprehensive Logo & Icon Generator
 *
 * Generates all logo and icon variations from scratch:
 * - SVG logos in multiple styles and sizes
 * - PNG conversions for all sizes
 * - ICO favicon
 * - Optimized SVGs
 * - Copies to correct locations (public/static/favicons/, etc.)
 */

import { create } from 'xmlbuilder2'
import sharp from 'sharp'
import { optimize } from 'svgo'
import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  primaryColor: '#FF4500', // OrangeRed
  bgColor: '#FFFFFF',
  darkBgColor: '#1E1E1E',
  text: 'A/A',
}

const SIZES = {
  favicon16: 16,
  favicon32: 32,
  favicon64: 64,
  favicon96: 96,
  favicon120: 120,
  androidChrome192: 192,
  appleTouchIcon: 180,
  favicon400: 400,
  androidChrome512: 512,
}

// ============================================================================
// SVG Logo Generators
// ============================================================================

/**
 * Generate logo with text from CONFIG
 * This is the preferred style
 */
function generateLogo(size: number): string {
  const svg = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('svg')
    .att('width', size)
    .att('height', size)
    .att('viewBox', `0 0 ${size} ${size}`)
    .att('xmlns', 'http://www.w3.org/2000/svg')

  const color = CONFIG.primaryColor
  const fontSize = size * 0.5

  // Draw text
  svg
    .ele('text')
    .att('x', size / 2)
    .att('y', size / 2)
    .att('font-family', "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', monospace")
    .att('font-size', fontSize)
    .att('font-weight', '600')
    .att('text-anchor', 'middle')
    .att('dominant-baseline', 'middle')
    .att('fill', color)
    .txt(CONFIG.text)

  return svg.end({ prettyPrint: true })
}

/**
 * Solid background version (for Apple Touch Icon, etc.)
 */
function generateSolidBgLogo(size: number, bgColor: string = CONFIG.bgColor): string {
  const svg = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('svg')
    .att('width', size)
    .att('height', size)
    .att('viewBox', `0 0 ${size} ${size}`)
    .att('xmlns', 'http://www.w3.org/2000/svg')

  // Background
  svg.ele('rect').att('width', size).att('height', size).att('fill', bgColor)

  const color = CONFIG.primaryColor
  const fontSize = size * 0.5

  // Draw text
  svg
    .ele('text')
    .att('x', size / 2)
    .att('y', size / 2)
    .att('font-family', "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', monospace")
    .att('font-size', fontSize)
    .att('font-weight', '600')
    .att('text-anchor', 'middle')
    .att('dominant-baseline', 'middle')
    .att('fill', color)
    .txt(CONFIG.text)

  return svg.end({ prettyPrint: true })
}

/**
 * Safari pinned tab (monochrome)
 */
function generateMonochromeLogo(size: number): string {
  const svg = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('svg')
    .att('width', size)
    .att('height', size)
    .att('viewBox', `0 0 ${size} ${size}`)
    .att('xmlns', 'http://www.w3.org/2000/svg')

  const fontSize = size * 0.3
  const color = '#000000'

  // Draw text
  svg
    .ele('text')
    .att('x', size / 2)
    .att('y', size / 2)
    .att('font-family', "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', monospace")
    .att('font-size', fontSize)
    .att('font-weight', '600')
    .att('text-anchor', 'middle')
    .att('dominant-baseline', 'middle')
    .att('fill', color)
    .txt(CONFIG.text)

  return svg.end({ prettyPrint: true })
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Optimize SVG using SVGO
 */
function optimizeSvg(svgString: string): string {
  const result = optimize(svgString, {
    multipass: true,
    plugins: [
      'preset-default',
      {
        name: 'removeViewBox',
        active: false,
      },
    ],
  })
  return result.data
}

/**
 * Convert SVG to PNG using Sharp
 */
async function svgToPng(svgString: string, outputPath: string, size: number): Promise<void> {
  await sharp(Buffer.from(svgString)).resize(size, size).png().toFile(outputPath)
}

/**
 * Generate ICO from PNG
 */
async function generateIco(pngPath: string, icoPath: string): Promise<void> {
  // ICO format: we'll use 32x32 PNG as ICO
  // Sharp doesn't directly support ICO, so we'll create a 32x32 PNG and rename it
  // For proper ICO support, you might want to use a separate tool, but modern browsers accept PNG
  await fs.promises.copyFile(pngPath, icoPath)
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// ============================================================================
// Main Generation Logic
// ============================================================================

async function generateAllIcons() {
  console.log('🎨 Starting comprehensive icon generation...\n')

  const assetsDir = path.join(__dirname)
  const faviconsDir = path.join(__dirname, '..', 'public', 'static', 'favicons')
  const tempDir = path.join(assetsDir, 'temp')

  // Ensure directories exist
  ensureDir(assetsDir)
  ensureDir(faviconsDir)
  ensureDir(tempDir)

  console.log('📁 Directories:')
  console.log(`   Assets: ${assetsDir}`)
  console.log(`   Favicons: ${faviconsDir}`)
  console.log()

  // ============================================================================
  // Step 1: Generate SVG logos for assets/
  // ============================================================================
  console.log('📝 Step 1: Generating SVG logos for assets/...')

  const assetSvgs = [
    { name: 'logo-geometric.svg', size: 120, generator: generateLogo },
    { name: 'logo-geometric-large.svg', size: 400, generator: generateLogo },
    { name: 'logo-geometric-favicon.svg', size: 64, generator: generateLogo },
  ]

  for (const { name, size, generator } of assetSvgs) {
    const svgContent = generator(size)
    const optimized = optimizeSvg(svgContent)
    const filePath = path.join(assetsDir, name)
    fs.writeFileSync(filePath, optimized)
    console.log(`   ✅ ${name} (${size}×${size})`)
  }
  console.log()

  // ============================================================================
  // Step 2: Generate favicon SVGs
  // ============================================================================
  console.log('📝 Step 2: Generating favicon SVGs...')

  const faviconSvgs = [
    { name: 'favicon.svg', size: SIZES.favicon64, generator: generateLogo },
    { name: 'favicon-16x16.svg', size: SIZES.favicon16, generator: generateLogo },
    { name: 'favicon-32x32.svg', size: SIZES.favicon32, generator: generateLogo },
    { name: 'android-chrome-192x192.svg', size: SIZES.androidChrome192, generator: generateLogo },
    { name: 'android-chrome-512x512.svg', size: SIZES.androidChrome512, generator: generateLogo },
    {
      name: 'apple-touch-icon.svg',
      size: SIZES.appleTouchIcon,
      generator: (s) => generateSolidBgLogo(s),
    },
    { name: 'safari-pinned-tab.svg', size: SIZES.favicon120, generator: generateMonochromeLogo },
  ]

  for (const { name, size, generator } of faviconSvgs) {
    const svgContent = generator(size)
    const optimized = optimizeSvg(svgContent)
    const filePath = path.join(faviconsDir, name)
    fs.writeFileSync(filePath, optimized)
    console.log(`   ✅ ${name} (${size}×${size})`)
  }
  console.log()

  // ============================================================================
  // Step 3: Generate PNG versions
  // ============================================================================
  console.log('📝 Step 3: Converting SVGs to PNGs...')

  const pngConversions = [
    { name: 'favicon-16x16.png', size: SIZES.favicon16, generator: generateSolidBgLogo },
    { name: 'favicon-32x32.png', size: SIZES.favicon32, generator: generateSolidBgLogo },
    { name: 'android-chrome-96x96.png', size: SIZES.favicon96, generator: generateSolidBgLogo },
    {
      name: 'apple-touch-icon.png',
      size: SIZES.appleTouchIcon,
      generator: (s) => generateSolidBgLogo(s),
    },
    { name: 'mstile-150x150.png', size: 150, generator: (s) => generateSolidBgLogo(s) },
  ]

  for (const { name, size, generator } of pngConversions) {
    const svgContent = generator(size)
    const outputPath = path.join(faviconsDir, name)
    await svgToPng(svgContent, outputPath, size)
    console.log(`   ✅ ${name} (${size}×${size})`)
  }
  console.log()

  // ============================================================================
  // Step 4: Generate ICO favicon
  // ============================================================================
  console.log('📝 Step 4: Generating favicon.ico...')

  const favicon32Path = path.join(faviconsDir, 'favicon-32x32.png')
  const faviconIcoPath = path.join(faviconsDir, 'favicon.ico')
  await generateIco(favicon32Path, faviconIcoPath)
  console.log(`   ✅ favicon.ico (32×32)`)
  console.log()

  // ============================================================================
  // Step 5: Copy logos to public/static/images/ and data/
  // ============================================================================
  console.log('📝 Step 5: Copying logos to public/static/images/ and data/...')

  const imagesDir = path.join(__dirname, '..', 'public', 'static', 'images')
  const dataDir = path.join(__dirname, '..', 'data')
  ensureDir(imagesDir)
  ensureDir(dataDir)

  const logosToCopy = [
    { from: 'logo-geometric.svg', to: 'logo-small.svg', dest: imagesDir },
    { from: 'logo-geometric-large.svg', to: 'logo-large.svg', dest: imagesDir },
    { from: 'logo-geometric.svg', to: 'logo.svg', dest: dataDir },
  ]

  for (const { from, to, dest } of logosToCopy) {
    const sourcePath = path.join(assetsDir, from)
    const destPath = path.join(dest, to)
    fs.copyFileSync(sourcePath, destPath)
    console.log(`   ✅ ${to} → ${path.relative(path.join(__dirname, '..'), dest)}`)
  }
  console.log()

  // ============================================================================
  // Step 6: Cleanup
  // ============================================================================
  console.log('📝 Step 6: Cleaning up...')
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true })
    console.log('   ✅ Removed temp directory')
  }
  console.log()

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('✨ Icon generation complete!\n')
  console.log('📊 Summary:')
  console.log(`   - ${assetSvgs.length} asset SVGs`)
  console.log(`   - ${faviconSvgs.length} favicon SVGs`)
  console.log(`   - ${pngConversions.length} PNGs`)
  console.log(`   - 1 ICO`)
  console.log(`   - ${logosToCopy.length} logos copied (data/ + public/static/images/)`)
  console.log()
  console.log('🎯 All files generated and copied to their correct locations!')
  console.log(`📁 Assets: ${assetsDir}`)
  console.log(`📁 Favicons: ${faviconsDir}`)
  console.log(`📁 Images: ${imagesDir}`)
  console.log(`📁 Data: ${dataDir}`)
  console.log()
  console.log('💡 Tip: Edit the CONFIG object in this script to customize colors and text!')
}

// ============================================================================
// Execute
// ============================================================================

if (require.main === module) {
  generateAllIcons().catch((error) => {
    console.error('❌ Error generating icons:', error)
    process.exit(1)
  })
}

export { generateAllIcons }
