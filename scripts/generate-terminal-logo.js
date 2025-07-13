const { create } = require('xmlbuilder2');
const fs = require('fs');

function generateTerminalLogo(width = 120, height = 120) {
  // Create SVG document
  const svg = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('svg')
    .att('width', width)
    .att('height', height)
    .att('viewBox', `0 0 ${width} ${height}`)
    .att('xmlns', 'http://www.w3.org/2000/svg');

  // No background - transparent logo

  // Add terminal text "aa_" - larger size, less background space
  svg.ele('text')
    .att('x', width / 2)
    .att('y', height / 2 + Math.floor(width * 0.06)) // Better centering for larger text
    .att('font-family', "'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace")
    .att('font-size', Math.floor(width * 0.35)) // Increased from 0.2 to 0.35 for larger text
    .att('font-weight', 'bold')
    .att('text-anchor', 'middle')
    .att('fill', '#22c55e')
    .txt('aa_');

  return svg.end({ prettyPrint: true });
}

// Generate different sizes
const sizes = [
  { name: 'logo.svg', size: 120 },
  { name: 'logo-large.svg', size: 400 },
  { name: 'logo-small.svg', size: 64 }
];

sizes.forEach(({ name, size }) => {
  const logoSVG = generateTerminalLogo(size, size);
  const filePath = name === 'logo.svg' ? `data/${name}` : `public/static/images/${name}`;
  
  fs.writeFileSync(filePath, logoSVG);
  console.log(`✅ Generated: ${filePath} (${size}x${size})`);
});

console.log('\n🎯 Terminal-style logo generated successfully!');
console.log('📁 Main logo: data/logo.svg');
console.log('📁 Large version: public/static/images/logo-large.svg');
console.log('📁 Small version: public/static/images/logo-small.svg'); 