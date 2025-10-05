# Logo & Icon Assets

This directory contains the ">AA" logo for **Anurag Ashok's** portfolio and blog, plus a comprehensive generation system.

## 🎨 Logo Style: Geometric

The geometric logo features a clean chevron (>) followed by the letters "AA" in a modern, dynamic design.

### Available in Assets

- **logo-geometric.svg** - 120×120 (general use)
- **logo-geometric-large.svg** - 400×400 (high resolution, social media)
- **logo-geometric-favicon.svg** - 64×64 (favicons, small icons)
- **logo.webp** - Photo/image version

All logos use the signature color `#FF4500` (OrangeRed).

## 🚀 One-Command Generation

Regenerate **ALL** logo and icon variations with a single command:

```bash
yarn generate:icons
```

This comprehensive script automatically:

- ✅ Generates all SVG logo variations
- ✅ Converts SVGs to PNGs for all required sizes
- ✅ Creates favicon.ico
- ✅ Optimizes all SVGs using SVGO
- ✅ Copies files to correct locations:
  - `assets/` - Source SVG logos
  - `public/static/favicons/` - All favicon formats
  - `public/static/images/` - Web-ready logos

### Generated Files

**Favicons (auto-generated):**

- `favicon.ico` (32×32)
- `favicon.svg`, `favicon-16x16.svg`, `favicon-32x32.svg`
- `apple-touch-icon.svg` + `.png` (180×180)
- `android-chrome-192x192.svg`, `android-chrome-512x512.svg`
- `android-chrome-96x96.png`
- `safari-pinned-tab.svg` (monochrome)
- `mstile-150x150.png` (Windows)

**Images (auto-copied):**

- `public/static/images/logo-small.svg` (120×120)
- `public/static/images/logo-large.svg` (400×400)

## ✏️ Customize

Edit `generate-icons.ts` to modify:

```typescript
const CONFIG = {
  primaryColor: '#FF4500', // Brand color
  bgColor: '#FFFFFF', // Light background
  darkBgColor: '#1E1E1E', // Dark background
  text: '>AA', // Logo text
}
```

You can also adjust:

- Logo sizes (see `SIZES` object)
- SVG generation styles
- Output paths

## 🛠️ Technical Details

**Tools Used:**

- `xmlbuilder2` - SVG generation
- `sharp` - High-performance image conversion (SVG → PNG)
- `svgo` - SVG optimization

**Design Details:**

- **Style**: Geometric, minimalist
- **Elements**: Chevron (>) + Letters (AA)
- **Color**: #FF4500 (OrangeRed)
- **Font**: SF Pro Display / Inter (sans-serif, weight 800)
- **Stroke**: Rounded line caps and joins
- **Theme**: Professional, modern, developer-focused

## 📋 Usage in Next.js

Import the logo in your components:

```tsx
import Image from 'next/image'
import logo from '@/assets/logo-geometric.svg'

;<Image src={logo} alt="Anurag Ashok" width={120} height={120} />
```

Or reference directly:

```tsx
<img src="/assets/logo-geometric.svg" alt="Anurag Ashok" />
```

## 🔧 Development

The generation script (`generate-icons.ts`) can be run with:

```bash
yarn generate:icons
# or
tsx assets/generate-icons.ts
```

It's a comprehensive TypeScript script that handles everything automatically - no manual file management needed!
