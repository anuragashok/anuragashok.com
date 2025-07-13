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

  // Define primary-600 color (Claret)
  const primaryColor = '#8B4A42';

  // Add sleek border
  svg.ele('rect')
    .att('x', 2)
    .att('y', 2)
    .att('width', width - 4)
    .att('height', height - 4)
    .att('fill', 'none')
    .att('stroke', primaryColor)
    .att('stroke-width', '2')
    .att('rx', '8')
    .att('ry', '8');

  // Add terminal text "<aa/>" - self-closing tag aesthetic
  svg.ele('text')
    .att('x', width / 2)
    .att('y', height / 2 + Math.floor(width * 0.06)) // Better centering for larger text
    .att('font-family', "'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace")
    .att('font-size', Math.floor(width * 0.35)) // Increased from 0.2 to 0.35 for larger text
    .att('font-weight', 'bold')
    .att('text-anchor', 'middle')
    .att('fill', primaryColor)
    .txt('<aa/>');

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