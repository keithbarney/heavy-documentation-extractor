# Heavy Documentation Extractor

Figma plugin that extracts content from selected sections to markdown with preserved hierarchy.

## What it does

1. Select one or more Figma Sections
2. Run the plugin
3. Copy or download the extracted markdown

Frames become headings (depth matches nesting level). Text nodes become body content. Component instances include metadata with variant properties. Decorative elements (shapes, dividers, backgrounds) are automatically filtered out.

## Features

- Extracts structured markdown from Figma sections
- Heading levels follow frame nesting depth (capped at h6)
- Component instances show name and variant properties
- Skips decorative elements (shapes, dividers, spacers)
- Skips auto-generated frame names (Frame 1, Frame 2, etc.)
- Supports multiple selected sections in one extraction
- Children sorted by visual position (top-to-bottom, left-to-right)
- Copy to clipboard or download as `.md` file
- Refresh button to re-extract after changes

## Install

Search for **Heavy Documentation Extractor** in the Figma Community, or import the `manifest.json` for local development.

## Development

```bash
npm install
npm run dev        # Watch mode
npm run build      # Production build
npm run typecheck   # Type checking
```

## Tech Stack

- TypeScript
- esbuild (bundler)
- Figma Plugin API

## Files

| File | Purpose |
|------|---------|
| `code.ts` | Extraction logic |
| `ui.html` | Preview, copy, and download UI |
| `manifest.json` | Plugin config |
