# Architecture Documentation

## Project Overview

Personal website and portfolio for Anurag Ashok built using the Tailwind Next.js Starter Blog template.

## Technology Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Content**: MDX (Markdown + JSX)
- **Icons**: Heroicons, Simple Icons

### Content Management

- **Blog Posts**: MDX files in `/data/blog/`
- **Authors**: MDX files in `/data/authors/`
- **Projects**: TypeScript configuration in `/data/projectsData.ts`
- **Site Config**: JavaScript configuration in `/data/siteMetadata.js`

### Key Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: System preference detection with manual toggle
- **SEO Optimized**: Meta tags, Open Graph, Twitter Cards
- **Blog System**: Full-featured blog with tags, categories, and search
- **Portfolio**: Project showcase with descriptions and links
- **Comments**: Giscus integration for blog comments
- **Analytics**: Support for multiple analytics providers
- **Search**: Built-in search functionality with Kbar
- **Newsletter**: Newsletter subscription integration
- **RSS Feed**: Automatic RSS feed generation

## Directory Structure

```
anuragashok.com/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── css/                   # Global CSS and Tailwind styles
├── data/                  # Content and configuration
│   ├── blog/             # Blog posts (MDX)
│   ├── authors/          # Author profiles (MDX)
│   ├── siteMetadata.js   # Site configuration
│   ├── headerNavLinks.ts # Navigation links
│   └── projectsData.ts   # Portfolio projects
├── layouts/               # Page layout components
├── public/               # Static assets
│   └── static/          # Images, icons, etc.
├── scripts/              # Build and utility scripts
└── contentlayer.config.ts # Content processing configuration
```

## Key Components

### Navigation

- Header with responsive navigation
- Dark mode toggle
- Mobile menu support
- Configurable navigation links

### Content Pages

- **Home**: Hero section with introduction
- **Blog**: List of blog posts with pagination
- **Projects**: Portfolio showcase
- **About**: Author information and bio
- **Tags**: Blog post categorization

### Blog Features

- MDX support for rich content
- Syntax highlighting for code blocks
- Table of contents generation
- Reading time estimation
- Social sharing buttons
- Related posts suggestions

## Configuration

### Site Metadata (`data/siteMetadata.js`)

- Site title, description, and URLs
- Author information
- Social media links
- Analytics configuration
- Comments system setup
- Newsletter integration

### Navigation (`data/headerNavLinks.ts`)

- Customizable navigation menu
- Support for external and internal links

### Projects (`data/projectsData.ts`)

- Portfolio project definitions
- Project descriptions and links
- Image references

## Deployment

- **Recommended**: Vercel (seamless Next.js integration)
- **Alternatives**: Netlify, AWS, or any static hosting service
- **Build Command**: `yarn build`
- **Start Command**: `yarn start`

## Development

- **Dev Server**: `yarn dev` (runs on http://localhost:3000)
- **Build**: `yarn build`
- **Lint**: `yarn lint`
- **Format**: `yarn format`

## Customization Points

1. **Styling**: Modify Tailwind configuration and CSS files
2. **Content**: Update MDX files and configuration
3. **Components**: Customize React components in `/components/`
4. **Layout**: Modify page layouts in `/layouts/`
5. **Features**: Enable/disable features in site metadata

## Current Theme

- **Color Palette**: Refined cyan theme using OKLCH color space
- **Primary Colors**: Modern cyan palette (50-950) with consistent hue and excellent contrast ratios
- **Typography**: Space Grotesk font family
- **Dark Mode**: Automatic system preference detection with manual toggle
- **Color Characteristics**: Consistent hue (~195°) across all shades for visual harmony

## Performance Optimizations

- Next.js Image optimization
- Static generation for blog posts
- Lazy loading for images
- Minified CSS and JavaScript
- Optimized font loading
