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

  // Define primary-600 color (Chardonnay)
  const primaryColor = '#B8944A';
  const circleColor = '#ee5c00'; // Vibrant orange for background

  // Add bracket background field with spacing
  const bracketWidth = Math.floor(width * 0.08);
  const bracketHeight = Math.floor(height * 0.6);
  const bracketY = (height - bracketHeight) / 2;
  const spacing = Math.floor(width * 0.05); // Add spacing between brackets and text
  const innerWidth = Math.floor(width * 0.4); // Reduce inner width to accommodate spacing
  const leftBracketX = (width - innerWidth) / 2 - bracketWidth - spacing;
  const rightBracketX = (width + innerWidth) / 2 + spacing;

  // Left bracket [
  svg.ele('rect')
    .att('x', leftBracketX)
    .att('y', bracketY)
    .att('width', bracketWidth)
    .att('height', Math.floor(bracketHeight * 0.15))
    .att('fill', circleColor);
  
  svg.ele('rect')
    .att('x', leftBracketX)
    .att('y', bracketY)
    .att('width', Math.floor(bracketWidth * 0.4))
    .att('height', bracketHeight)
    .att('fill', circleColor);
    
  svg.ele('rect')
    .att('x', leftBracketX)
    .att('y', bracketY + bracketHeight - Math.floor(bracketHeight * 0.15))
    .att('width', bracketWidth)
    .att('height', Math.floor(bracketHeight * 0.15))
    .att('fill', circleColor);

  // Right bracket ]
  svg.ele('rect')
    .att('x', rightBracketX)
    .att('y', bracketY)
    .att('width', bracketWidth)
    .att('height', Math.floor(bracketHeight * 0.15))
    .att('fill', circleColor);
    
  svg.ele('rect')
    .att('x', rightBracketX + bracketWidth - Math.floor(bracketWidth * 0.4))
    .att('y', bracketY)
    .att('width', Math.floor(bracketWidth * 0.4))
    .att('height', bracketHeight)
    .att('fill', circleColor);
    
  svg.ele('rect')
    .att('x', rightBracketX)
    .att('y', bracketY + bracketHeight - Math.floor(bracketHeight * 0.15))
    .att('width', bracketWidth)
    .att('height', Math.floor(bracketHeight * 0.15))
    .att('fill', circleColor);

  // Add terminal text "aa;" - statement terminator aesthetic
  const fontSize = Math.floor(width * 0.35);
  svg.ele('text')
    .att('x', width / 2)
    .att('y', height / 2 + fontSize * 0.1) // Adjust for bracket centering
    .att('font-family', "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace")
    .att('font-size', fontSize)
    .att('font-weight', '500') // Medium weight for better readability in monospace
    .att('text-anchor', 'middle')
    .att('dominant-baseline', 'middle') // Center in brackets
    .att('fill', circleColor) // Use same color as brackets for cohesion
    .txt('aa;');

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