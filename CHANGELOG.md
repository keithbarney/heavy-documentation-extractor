# Changelog

All notable changes to Heavy Documentation Extractor.

## [1.2.0] — 2026-02-18

### Added
- **JSON export** — structured tree output with stats, section name, and ISO date
- **HTML export** — self-contained HTML file with inline styles, ready for browser/CMS
- **Format tabs** — MD / JSON / HTML switcher in the UI with per-format caching
- **Bold / italic detection** — font weight ≥ 600 → `**bold**`, italic style → `*italic*`
- **Sticky note support** — STICKY nodes render as blockquote lines (`> text`)
- **Stats bar** — live counts: headings, text nodes, components, total word count
- **Loading overlay** — spinner during extraction so users know the plugin is working
- **Better component name parsing** — strips variant suffix from component set names (`Button/Size=Large` → `Button`)
- **Decorative name list expanded** — added `hr`, `decoration`, `ornament` to skip list
- **Multiple sections** now separated by horizontal rule `---` in Markdown output
- **Consecutive blank line collapsing** — no double-blank-line runs in Markdown output
- **MIME types** — correct MIME per download format (text/markdown, application/json, text/html)
- Plugin window size bumped to 520×460 to accommodate stats bar

### Fixed
- Broken `heavy-theme.css` symlink replaced with direct file copy
- `status` element error state now uses distinct CSS class (`error-msg`) to avoid conflicts

### Changed
- `figma.ui.postMessage` message type renamed from `markdown` → `result` with a `format` field (backward-compatible — UI handles both)
- Refresh now clears all format caches and re-extracts the active format

## [1.0.0] — 2026-02-14

### Initial release
- Extract text from Figma Sections as Markdown
- Heading levels follow frame nesting depth (capped at h6)
- Component instances show name and variant properties
- Decorative elements filtered out (shapes, dividers, spacers, backgrounds)
- Auto-generated frame names (Frame 1, Frame 2) treated as pass-through
- Multiple sections combined into one output
- Children sorted by visual position (top-to-bottom, left-to-right)
- Copy to clipboard or download as `.md`
- Refresh button for live re-extraction
- Published to Figma Community (Plugin ID: 1598142824384634453)
