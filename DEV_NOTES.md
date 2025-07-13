# Development Notes

## Task: Scaffold Personal Website + Portfolio

### Plan:

1. ✅ Clone the Tailwind Next.js Starter Blog template from timlrx/tailwind-nextjs-starter-blog
2. ✅ Install dependencies using yarn
3. ✅ Customize the basic configuration files:
   - ✅ `data/siteMetadata.js` - site information
   - ✅ `data/authors/default.mdx` - author information
   - ✅ `data/headerNavLinks.ts` - navigation links
   - ✅ `data/projectsData.ts` - portfolio projects
4. ✅ Set up the development environment
5. ✅ Create architecture documentation
6. ✅ Test the setup

### Key Features to Leverage:

- Next.js 14 with App Router
- Tailwind CSS for styling
- MDX support for content
- Built-in blog functionality
- Projects page for portfolio
- SEO optimization
- Responsive design

### Completed:

- ✅ Successfully cloned and set up the template
- ✅ Installed all dependencies without major issues
- ✅ Customized site metadata for Anurag Ashok
- ✅ Updated author profile information
- ✅ Added sample portfolio projects
- ✅ Development server running on http://localhost:3000
- ✅ Created comprehensive architecture documentation

### Next Steps for Customization:

1. **Content Creation**:

   - Add blog posts in `/data/blog/`
   - Update project images in `/public/static/images/`
   - Create an "About" page with detailed information

2. **Styling Customization**:

   - Customize Tailwind configuration
   - Add custom CSS for branding
   - Update color scheme if needed

3. **Feature Configuration**:

   - Set up analytics (Google Analytics, Umami, etc.)
   - Configure newsletter integration
   - Set up comments system (Giscus)

4. **Deployment**:

   - Deploy to Vercel or preferred hosting platform
   - Set up custom domain
   - Configure environment variables

5. **SEO & Performance**:
   - Add custom meta tags
   - Optimize images
   - Set up sitemap

### Development Commands:

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run linting
- `yarn format` - Format code

### Status: ✅ COMPLETED

The personal website scaffold is ready for development and customization! # Test

## Task: Change Theme to Cyan Color Palette

### Plan:

1. ✅ Update the Tailwind CSS configuration to use the new cyan color palette
2. ✅ Update any hardcoded color references in components
3. ✅ Test the new theme on both light and dark modes
4. ✅ Commit the changes

### Cyan Color Palette (OKLCH):

```css
--color-cyan-50: oklch(95.65% 0.021 274.08);
--color-cyan-100: oklch(92.38% 0.036 272.09);
--color-cyan-200: oklch(83.76% 0.08 269.81);
--color-cyan-300: oklch(76.15% 0.121 266.46);
--color-cyan-400: oklch(68.61% 0.165 261.43);
--color-cyan-500: oklch(59.95% 0.203 255.78);
--color-cyan-600: oklch(52.19% 0.177 255.83);
--color-cyan-700: oklch(42.6% 0.144 255.8);
--color-cyan-800: oklch(32.91% 0.113 256.06);
--color-cyan-900: oklch(23.53% 0.079 255.47);
--color-cyan-950: oklch(19% 0.063 255.24);
```

### Changes Made:

- Updated `css/tailwind.css` to replace the Chardonnay theme colors with the new cyan palette
- All primary color variables now use the cyan OKLCH values
- Theme comment updated from "Chardonnay Theme" to "Cyan Theme"

### Status: ✅ COMPLETED

## Task: Update to Refined Cyan Color Palette

### Plan:

1. ✅ Update the Tailwind CSS configuration to use the refined cyan color palette
2. ✅ Test the new theme on both light and dark modes
3. ✅ Commit the changes

### Refined Cyan Color Palette (OKLCH):

```css
--color-cyan-50: oklch(94.76% 0.079 195.87);
--color-cyan-100: oklch(89.73% 0.153 194.76);
--color-cyan-200: oklch(81.26% 0.139 194.76);
--color-cyan-300: oklch(72.57% 0.124 194.76);
--color-cyan-400: oklch(64.19% 0.11 194.76);
--color-cyan-500: oklch(55.84% 0.095 194.76);
--color-cyan-600: oklch(47.47% 0.081 194.76);
--color-cyan-700: oklch(39.05% 0.067 194.76);
--color-cyan-800: oklch(30.49% 0.052 194.76);
--color-cyan-900: oklch(22.05% 0.038 194.76);
--color-cyan-950: oklch(17.32% 0.03 194.76);
```

### Changes Made:

- Updated `css/tailwind.css` with the refined cyan color palette
- All primary color variables now use the new OKLCH values with consistent hue (194.76-195.87)
- Theme comment updated to "Refined Cyan Theme"

### Status: ✅ COMPLETED

## Task: Update to Casper Theme with Custom Typography

### Plan:

1. ✅ Update the Tailwind CSS configuration to use the Casper color palette
2. ✅ Add custom typography with Tiro Tamil and Noto Sans Elbasan fonts
3. ✅ Update border radius configuration
4. ✅ Test the new theme on both light and dark modes
5. ✅ Commit the changes

### Casper Theme Configuration:

```css
--color-casper-50: oklch(98.41% 0.01 219.38deg);
--color-casper-100: oklch(96.75% 0.01 225.89deg);
--color-casper-200: oklch(92.92% 0.02 220.81deg);
--color-casper-300: oklch(79.57% 0.04 223.96deg);
--color-casper-400: oklch(70.42% 0.07 223.92deg);
--color-casper-500: oklch(55.29% 0.08 224.36deg);
--color-casper-600: oklch(44.45% 0.07 223.99deg);
--color-casper-700: oklch(37.38% 0.07 225.3deg);
--color-casper-800: oklch(28.58% 0.06 230.13deg);
--color-casper-900: oklch(21.97% 0.05 239.45deg);
--color-casper-950: oklch(14.4% 0.04 251.92deg);

--color-dove-gray-50: oklch(98.51% 0 none);
--color-dove-gray-100: oklch(97.02% 0 none);
--color-dove-gray-200: oklch(92.19% 0 none);
--color-dove-gray-300: oklch(86.99% 0 none);
--color-dove-gray-400: oklch(70.9% 0 none);
--color-dove-gray-500: oklch(55.55% 0 none);
--color-dove-gray-600: oklch(43.86% 0 none);
--color-dove-gray-700: oklch(37.15% 0 none);
--color-dove-gray-800: oklch(26.86% 0 none);
--color-dove-gray-900: oklch(20.46% 0 none);
--color-dove-gray-950: oklch(14.48% 0 none);

--font-heading: 'Tiro Tamil', serif;
--font-body: 'Noto Sans Elbasan', sans-serif;

--radius: 0.5rem;
```

### Changes Made:

- Updated `css/tailwind.css` with the Casper color palette (subtle blue-gray tones)
- Added custom typography with Tiro Tamil (heading) and Noto Sans (body) fonts
- Updated `app/layout.tsx` to import and configure the new fonts
- Added border radius configuration (0.5rem)
- Updated font variable mappings in CSS

### Status: ✅ COMPLETED

## Task: Update to Shingle Fawn Theme

### Plan:

1. ✅ Update the Tailwind CSS configuration to use the Shingle Fawn color palette
2. ✅ Update the gray colors to standard hex values
3. ✅ Test the new theme on both light and dark modes
4. ✅ Commit the changes

### Shingle Fawn Theme Configuration:

```css
--color-shingle-fawn-50: #fffaed;
--color-shingle-fawn-100: #fff5d9;
--color-shingle-fawn-200: #ffeab0;
--color-shingle-fawn-300: #ffdb89;
--color-shingle-fawn-400: #f1c96c;
--color-shingle-fawn-500: #dcb764;
--color-shingle-fawn-600: #b3944d;
--color-shingle-fawn-700: #876f37;
--color-shingle-fawn-800: #725e30;
--color-shingle-fawn-900: #5a4b29;
--color-shingle-fawn-950: #332910;

--color-dove-gray-50: #fafafa;
--color-dove-gray-100: #f5f5f5;
--color-dove-gray-200: #e5e5e5;
--color-dove-gray-300: #d4d4d4;
--color-dove-gray-400: #a1a1a1;
--color-dove-gray-500: #737373;
--color-dove-gray-600: #525252;
--color-dove-gray-700: #404040;
--color-dove-gray-800: #262626;
--color-dove-gray-900: #171717;
--color-dove-gray-950: #0a0a0a;

--font-heading: 'Tiro Tamil', serif;
--font-body: 'Noto Sans Elbasan', sans-serif;

--radius: 0.5rem;
```

### Changes Made:

- Updated `css/tailwind.css` with the Shingle Fawn color palette (warm, earthy tones)
- Converted from OKLCH to hex color format for better compatibility
- Updated gray colors to standard hex values with improved contrast
- Maintained custom typography (Tiro Tamil + Noto Sans)
- Theme comment updated to "Shingle Fawn Theme"

### Status: ✅ COMPLETED

---
