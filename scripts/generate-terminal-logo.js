const { create } = require('xmlbuilder2')
const fs = require('fs')

function generateTerminalLogo(width = 120, height = 120) {
  // Create SVG document
  const svg = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('svg')
    .att('width', width)
    .att('height', height)
    .att('viewBox', `0 0 ${width} ${height}`)
    .att('xmlns', 'http://www.w3.org/2000/svg')

  // Define primary-600 color (Chardonnay)
  const primaryColor = '#B8944A'
  const circleColor = '#FF4500' // OrangeRed for background

  // Add code editor tab background field (vertical rectangle with top-right cut corner)
  const tabWidth = Math.floor(width * 0.63) // Tab width (63% of logo width, 10% thinner)
  const tabHeight = Math.floor(height * 0.8) // Tab height (80% of logo height)
  const tabX = (width - tabWidth) / 2
  const tabY = (height - tabHeight) / 2
  const cutSize = Math.floor(tabWidth * 0.25) // Size of top-right corner cut

  // Create vertical rectangle with single top-right cut corner (code editor tab shape)
  const tabPoints = [
    `${tabX},${tabY}`, // Top left
    `${tabX + tabWidth - cutSize},${tabY}`, // Top right before cut
    `${tabX + tabWidth},${tabY + cutSize}`, // Top right after cut (angled)
    `${tabX + tabWidth},${tabY + tabHeight}`, // Bottom right
    `${tabX},${tabY + tabHeight}`, // Bottom left
    `${tabX},${tabY}`, // Back to top left
  ]

  // Create code editor tab shape
  svg
    .ele('polygon')
    .att('points', tabPoints.join(' '))
    .att('fill', circleColor)
    .att('opacity', '0.9')

  // Add terminal text "aa;" - statement terminator aesthetic
  const fontSize = Math.floor(width * 0.3) // Reduced font size for better proportions
  svg
    .ele('text')
    .att('x', width / 2)
    .att('y', height / 2 + fontSize * 0.1) // Adjust for tab centering
    .att(
      'font-family',
      "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace"
    )
    .att('font-size', fontSize)
    .att('font-weight', '500') // Medium weight for better readability in monospace
    .att('text-anchor', 'middle')
    .att('dominant-baseline', 'middle') // Center in code tab
    .att('fill', '#ffffff') // White text for contrast against tab
    .txt('aa;')

  return svg.end({ prettyPrint: true })
}

// Generate different sizes including favicons
const sizes = [
  { name: 'logo.svg', size: 120, path: 'data' },
  { name: 'logo-large.svg', size: 400, path: 'public/static/images' },
  { name: 'logo-small.svg', size: 64, path: 'public/static/images' },
  // Favicon sizes
  { name: 'favicon.svg', size: 32, path: 'public/static/favicons' },
  { name: 'apple-touch-icon.svg', size: 180, path: 'public/static/favicons' },
  { name: 'favicon-16x16.svg', size: 16, path: 'public/static/favicons' },
  { name: 'favicon-32x32.svg', size: 32, path: 'public/static/favicons' },
  { name: 'android-chrome-192x192.svg', size: 192, path: 'public/static/favicons' },
  { name: 'android-chrome-512x512.svg', size: 512, path: 'public/static/favicons' },
]

sizes.forEach(({ name, size, path }) => {
  const logoSVG = generateTerminalLogo(size, size)
  const filePath = `${path}/${name}`

  // Ensure directory exists
  const dir = path
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(filePath, logoSVG)
  console.log(`✅ Generated: ${filePath} (${size}x${size})`)
})

console.log('\n🎯 Terminal-style logo and favicons generated successfully!')
console.log('📁 Main logo: data/logo.svg')
console.log('📁 Large version: public/static/images/logo-large.svg')
console.log('📁 Small version: public/static/images/logo-small.svg')
console.log('🔖 Favicons: public/static/favicons/ (multiple sizes)')
console.log('📱 Apple touch icon: public/static/favicons/apple-touch-icon.svg')
console.log('🤖 Android icons: public/static/favicons/android-chrome-*.svg')
