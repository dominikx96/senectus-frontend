# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Purpose**: Administrative dashboard for social service institutions to manage AI-assisted grocery orders placed by seniors.

This is part of a senior assistance system where an AI voice agent helps elderly people place online grocery orders via simple phone calls. Social service support staff use this dashboard to review, approve, or decline orders placed by seniors through the AI agent.

**Technical Stack**: Next.js 15 dashboard application using the App Router with TypeScript, Tailwind CSS v4, and shadcn/ui components.

**Key Functionality**:
- View orders placed by seniors through the AI voice agent
- Review order details (items, quantities, pricing)
- Approve or decline pending orders
- Monitor order status and history
- Manage senior profiles and preferences

**Backend Integration**: The dashboard integrates with a Medusa JS e-commerce store via MCP (Model Context Protocol) to fetch orders, products, and cart information.

## Development Commands

**Start development server:**
```bash
npm run dev
```
Opens on http://localhost:3000. Uses Turbopack for fast refresh.

**Build for production:**
```bash
npm run build
```
Uses Turbopack for optimized production builds.

**Start production server:**
```bash
npm start
```

**Lint code:**
```bash
npm run lint
```
Uses ESLint with Next.js configuration.

## Architecture

### Tech Stack
- **Framework**: Next.js 15.5.6 with App Router
- **React**: Version 19.1.0
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with CSS variables and OKLCH color space
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Geist Mono (via next/font)

### Directory Structure
```
src/
├── app/              # Next.js App Router pages and layouts
│   ├── layout.tsx   # Root layout with font loading
│   ├── page.tsx     # Homepage
│   └── globals.css  # Global styles with Tailwind v4 and theme variables
├── components/
│   └── ui/          # shadcn/ui components (e.g., button.tsx)
└── lib/
    └── utils.ts     # Utilities (cn function for className merging)
```

### Path Aliases
Configured in tsconfig.json:
- `@/*` maps to `./src/*`

shadcn/ui specific aliases (components.json):
- `@/components` - component directory
- `@/lib` - utility functions
- `@/ui` - UI components
- `@/hooks` - custom hooks

### Styling System

**Tailwind CSS v4**: Uses inline `@theme` configuration in globals.css instead of traditional tailwind.config.js/ts.

**Color System**:
- Uses OKLCH color space for better perceptual uniformity
- Defined as CSS variables with light/dark mode support
- Custom dark mode variant: `@custom-variant dark (&:is(.dark *))`

**Design Tokens**:
- Base radius: `0.625rem` (10px)
- Radius scale: sm, md, lg, xl (calculated from base)
- Comprehensive color palette including sidebar, chart, and semantic colors

### Component System

**shadcn/ui Configuration** (components.json):
- Style: "new-york"
- RSC: enabled (React Server Components)
- Base color: "neutral"
- CSS variables: enabled
- Icon library: lucide-react

**Adding Components**:
shadcn/ui components should be installed using the CLI, which will automatically place them in `src/components/ui/` following the configured aliases.

### TypeScript Configuration
- Target: ES2017
- Strict mode: enabled
- Module resolution: "bundler"
- JSX: preserve (Next.js handles transformation)
- Incremental builds: enabled

## Medusa MCP Integration

The dashboard integrates with a Medusa JS e-commerce store via **MCP (Model Context Protocol)** to manage the backend for senior grocery orders.

**MCP Server**: Expected to run on http://localhost:9000/mcp/mcp

**Available MCP Tools** (see `docs/endpoints.md` for test script):
- `list_regions` - Get available shipping regions
- `list_products` - Browse product catalog
- `get_product` - Get detailed product information with variants
- `create_cart` - Create shopping cart with items
- `get_cart` - Retrieve cart details
- `add_to_cart` - Add items to existing cart
- `update_cart_item` - Modify item quantities
- `create_order` - Complete order with shipping address

**Integration Pattern**:
The MCP protocol uses JSON-RPC 2.0 format over HTTP. Standard HTTP POST requests with JSON payloads. See the test script in `docs/endpoints.md` for request/response patterns.

**Dashboard Use Cases**:
- Fetch orders placed by seniors through the AI voice agent
- Display product details and pricing
- Review cart contents before order approval
- Monitor order status and history
- Manage shipping addresses and regions

When implementing Medusa integration features, reference the test script patterns in `docs/endpoints.md` for expected API call structures and response handling.

## Next.js App Router Patterns

- Server Components by default (RSC enabled)
- Client components must use `'use client'` directive
- Metadata export for SEO in layout.tsx
- Font optimization using next/font with CSS variables
- Page auto-updates on edit during development

## Turbopack Usage

Both dev and build commands use `--turbopack` flag for faster bundling and HMR (Hot Module Replacement). This is Next.js's Rust-based bundler replacing Webpack.
