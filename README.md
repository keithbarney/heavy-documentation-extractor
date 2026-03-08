# Heavy Documentation Extractor

Figma plugin that extracts content from selected Sections and exports it as **Markdown**, **JSON**, or **HTML** — with preserved hierarchy, rich text styling, and component metadata.

## What it does

1. Select one or more Figma Sections
2. Run the plugin
3. Switch between **MD / JSON / HTML** export tabs
4. Copy to clipboard or download the file

Frames become headings (depth matches nesting level). Text nodes become body content. Bold and italic text styles are preserved in output. Component instances include name and variant properties. Sticky notes render as blockquotes. Decorative elements (shapes, dividers, backgrounds) are automatically filtered out.

## Features

- **Three export formats:** Markdown (`.md`), JSON (`.json`), HTML (`.html`)
- **Bold / italic detection:** font weight ≥ 600 → `**bold**`, italic style → `*italic*`
- **Sticky note support:** sticky nodes render as blockquote (`>`) blocks
- **Stats bar:** live count of headings, text nodes, components, and total word count
- **Format tabs:** switch between MD/JSON/HTML — re-extracts on first switch, then cached
- **Loading indicator:** spinner overlay during extraction
- **Heading levels follow nesting depth** (capped at h6)
- **Component instances** show name and variant properties
- **Skips decorative elements** (shapes, dividers, spacers, backgrounds, etc.)
- **Skips auto-generated names** (Frame 1, Frame 2, etc.)
- **Multiple sections** combined into one output, separated by `---`
- **Children sorted by visual position** (top-to-bottom, left-to-right)
- **Copy to clipboard** or **download** the file
- **Refresh** re-extracts after Figma changes (clears all format caches)

## Export Formats

### Markdown (`.md`)
Standard markdown with ATX headings (`#`, `##`, etc.), bold/italic inline, component refs as `[Component: Name | Variant: Value]`, and sticky notes as blockquotes.

### JSON (`.json`)
Structured tree:
```json
{
  "version": "1.2.0",
  "extracted": "2025-01-01",
  "section": "Button Docs",
  "stats": { "headings": 3, "textNodes": 12, "components": 2 },
  "content": [
    { "kind": "heading", "level": 1, "text": "Button Docs", "children": [...] },
    { "kind": "text", "text": "Body content" },
    { "kind": "component", "text": "Button", "componentName": "Button", "variants": { "Size": "Large" } }
  ]
}
```

### HTML (`.html`)
Self-contained HTML file with inline styles — ready to open in a browser or paste into a CMS.

## Install

Search for **Heavy Documentation Extractor** in the Figma Community, or import the `manifest.json` for local development.

**Plugin ID:** `1598142824384634453`

## Development

```bash
npm install
npm run dev        # Build UI + watch mode for code
npm run build      # Production build (UI + minified code.js)
npm run typecheck  # Type checking (no emit)
```

## Tech Stack

- TypeScript (strict)
- esbuild (bundler, target: ES6 for Figma sandbox)
- Figma Plugin API v1.0.0

## Files

| File | Purpose |
|------|---------|
| `code.ts` | Extraction logic, format renderers |
| `ui.src.html` | UI source — edit this for UI changes |
| `ui.html` | **Build artifact** — generated from `ui.src.html` + `heavy-theme.css` |
| `heavy-theme.css` | Shared Spacegray dark theme |
| `build-ui.js` | Inlines CSS into ui.src.html → ui.html |
| `manifest.json` | Plugin config |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
