# Heavy Documentation Extractor

Figma plugin that extracts text from a selected section and converts it to Markdown, preserving hierarchy based on font sizes.

**Important:** When working on this project, reference the official Figma Plugin documentation for API details, best practices, and capabilities: https://www.figma.com/plugin-docs/

## Files

| File | Purpose |
|------|---------|
| `code.ts` | Main plugin logic (text extraction, heading mapping, Markdown conversion) |
| `ui.html` | UI panel with preview, copy, and download buttons |
| `manifest.json` | Plugin configuration |
| `package.json` | Build scripts |

## Build

```bash
npm install      # Install dependencies
npm run dev      # Watch mode (esbuild)
npm run build    # Production build (minified)
npm run typecheck # Type checking
```

## Build Target

esbuild uses `--target=es6` because Figma's plugin sandbox doesn't support ES2020+ syntax (e.g., `??`, `?.`). Write modern TypeScript freely — esbuild transpiles it down automatically.

## How It Works

1. Select a Section in Figma
2. Run the plugin
3. Text nodes are extracted and sorted by position (top-to-bottom, left-to-right)
4. Font sizes map to heading levels (largest 3 sizes → h1, h2, h3)
5. Preview displays in the UI with options to copy or download as .md
