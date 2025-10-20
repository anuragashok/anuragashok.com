# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
yarn dev              # Start development server at http://localhost:3000
yarn build            # Build for production (runs postbuild script to generate RSS)
yarn serve            # Start production server
yarn lint             # Run ESLint with auto-fix on pages, app, components, lib, layouts, scripts
yarn analyze          # Build with bundle analyzer enabled

# Icon Generation
yarn generate:icons   # Generate favicon assets from assets/generate-icons.ts
```

## Architecture Overview

This is a Next.js 14+ personal website and blog built on the Tailwind Next.js Starter Blog template. The architecture follows Next.js App Router patterns with TypeScript and MDX content.

### Content System (Contentlayer)

Content is managed through **Contentlayer** (v2), which processes MDX files and generates TypeScript types.

- **Blog posts**: `data/blog/**/*.mdx` - Processed into Blog document types
- **Authors**: `data/authors/**/*.mdx` - Processed into Authors document types
- **Configuration**: `contentlayer.config.ts` defines document schemas and MDX processing pipeline

**Key Contentlayer behaviors**:

- On build success, generates tag count JSON (`app/tag-data.json`) from all blog post tags
- Creates search index at `public/search.json` if kbar search is enabled
- Computed fields include: `readingTime`, `slug`, `path`, `filePath`, `toc` (table of contents), `structuredData`
- Frontmatter fields: `title` (required), `date` (required), `tags`, `lastmod`, `draft`, `summary`, `images`, `authors`, `layout`, `bibliography`, `canonicalUrl`

### Layout Structure

The root layout (`app/layout.tsx`) implements a **two-column layout**:

- **Main content area**: Left column, flexible width
- **Sticky sidebar**: Right column (64 width units on large screens)
  - Contains `AboutMe` component
  - Contains `TagsSidebar` component
  - Uses `sticky top-24` positioning

This differs from typical blog layouts - the sidebar is always visible on large screens and includes author info + tag navigation.

### MDX Processing Pipeline

The content pipeline uses these remark/rehype plugins (in order):

**Remark plugins** (process markdown):

1. `remarkExtractFrontmatter` - Extracts frontmatter from MDX
2. `remarkGfm` - GitHub Flavored Markdown support
3. `remarkCodeTitles` - Code block titles
4. `remarkMath` - Math equation support
5. `remarkImgToJsx` - Converts images to Next.js Image components
6. `remarkAlert` - GitHub-style alerts/callouts

**Rehype plugins** (process HTML):

1. `rehypeSlug` - Adds IDs to headings
2. `rehypeAutolinkHeadings` - Adds anchor links to headings (prepend behavior with custom icon)
3. `rehypeKatex` - Renders math equations
4. `rehypeKatexNoTranslate` - Prevents translation of math
5. `rehypeCitation` - Bibliography and citation support (reads from `data/` directory)
6. `rehypePrismPlus` - Syntax highlighting with line numbers (default: JavaScript)
7. `rehypePresetMinify` - Minifies HTML output

### Theme System

**Color Palette**: Vermilion theme using OKLCH color space

- Primary color variables: `--color-vermilion-{50-950}` with vibrant red-orange hues (34-42° hue)
- Gray palette: `--color-dove-gray-{50-950}` using OKLCH for consistency
- High chroma values (up to 0.23) for bold, energetic visual presence

**Typography**:

- Headings: Tiro Tamil (serif) via `--font-tiro-tamil`
- Body: Noto Sans (sans-serif) via `--font-noto-sans`
- Fallback: Space Grotesk via `--font-space-grotesk`
- All fonts loaded via `next/font/google` in `app/layout.tsx`

**Dark Mode**: System preference detection with manual toggle via `next-themes`

### Path Aliases

TypeScript path mappings (from `tsconfig.json`):

```typescript
"@/components/*" → "components/*"
"@/data/*" → "data/*"
"@/layouts/*" → "layouts/*"
"@/css/*" → "css/*"
"contentlayer/generated" → "./.contentlayer/generated"
```

### Security Configuration

Content Security Policy is defined in `next.config.js`:

- Allows `giscus.app` for comments
- Allows `analytics.umami.is` for analytics
- Permits `'unsafe-eval'` and `'unsafe-inline'` for scripts (required for Next.js)
- If adding new external services, update CSP accordingly

### Build Process

The build has a custom postbuild step (`scripts/postbuild.mjs`) that runs after `next build`:

```bash
cross-env INIT_CWD=$PWD next build && cross-env NODE_OPTIONS='--experimental-json-modules' node ./scripts/postbuild.mjs
```

This postbuild script generates the RSS feed (`scripts/rss.mjs`).

## Configuration Files

- `data/siteMetadata.js` - Primary site configuration (title, author, social links, analytics, comments, newsletter, search provider)
- `data/headerNavLinks.ts` - Navigation menu items
- `data/projectsData.ts` - Portfolio projects data
- `data/authors/default.mdx` - Default author profile (required)

## Blog Post Layouts

Three blog post layout options (specified in frontmatter `layout` field):

- `PostLayout` (default) - Two-column layout with meta and author information
- `PostSimple` - Simplified single-column layout
- `PostBanner` - Layout with hero banner image

Two blog listing layouts:

- `ListLayout` - Version 1 layout with search bar
- `ListLayoutWithTags` - Version 2 layout with tags sidebar (currently used)

## Static Export

For static hosting (GitHub Pages, S3, etc.):

```bash
EXPORT=1 UNOPTIMIZED=1 yarn build
```

With base path:

```bash
EXPORT=1 UNOPTIMIZED=1 BASE_PATH=/myblog yarn build
```

Then deploy the `out/` folder. Note: Comment out `headers()` in `next.config.js` and remove API routes for static builds.

## Custom Components

Custom MDX components can be added in `components/MDXComponents.tsx`. These components are available in all MDX files without imports. Default exports include:

- Custom Link component
- Next.js Image component
- Table of Contents component
- TableWrapper
- Newsletter form

## SVG Handling

SVG files are processed through `@svgr/webpack` (configured in `next.config.js`), allowing SVGs to be imported as React components.

## Package Manager

This project uses **Yarn 3.6.1** (configured via `packageManager` field in `package.json`). Use `yarn` for all package operations.
