# Heavy Documentation Extractor — User Stories

## Content Extraction

### US-1: Extract markdown from a selected section
- [x] **As a** designer,
**I want to** select a Figma Section and extract its text content as Markdown,
**So that** I can document my designs without manually copying text layer by layer.

**Given** a Section is selected on the current page
**When** the plugin runs (automatically on launch)
**Then** all text nodes inside the section are extracted, sorted by visual position (top-to-bottom, left-to-right), and rendered as Markdown in the preview pane

---

### US-2: Preserve heading hierarchy from frame nesting depth
- [x] **As a** designer,
**I want to** nested frames and sections to become Markdown headings at the correct level,
**So that** the document structure mirrors my Figma layout hierarchy.

**Given** a Section contains frames nested 1, 2, or 3 levels deep with named frames
**When** the extraction runs
**Then** each named frame becomes a heading (h1 through h6 based on nesting depth), and the heading level is capped at h6

---

### US-3: Skip decorative and auto-named frames
- [x] **As a** designer,
**I want to** decorative elements and auto-generated frame names to be excluded from the output,
**So that** the Markdown contains only meaningful content.

**Given** a section contains rectangles, ellipses, lines, vectors, and frames named "Frame 1", "spacer", "divider", or "background"
**When** the extraction runs
**Then** those nodes are skipped entirely and do not appear in the Markdown output

---

### US-4: Extract from multiple selected sections
- [x] **As a** designer,
**I want to** select multiple sections and extract them all at once,
**So that** I can generate documentation for an entire page in one action.

**Given** two or more Sections are selected
**When** the extraction runs
**Then** content from all selected sections is concatenated with blank lines between them, and the filename uses "sections" (plural) instead of a single section name

---

### US-5: Capture component instance metadata
- [x] **As a** designer,
**I want to** component instances in my documentation to include their variant properties,
**So that** the Markdown shows which component variant is being referenced.

**Given** a section contains a component instance with variant properties (e.g., Type=Primary, Size=Large)
**When** the extraction runs
**Then** the output includes a metadata line like `[Component: Button | Type: Primary, Size: Large]` followed by any text content inside the instance

---

## Output & Export

### US-6: Copy extracted markdown to clipboard
- [x] **As a** designer,
**I want to** copy the extracted Markdown to my clipboard with one click,
**So that** I can paste it into docs, wikis, or other tools.

**Given** the extraction has completed and Markdown is displayed in the preview
**When** I click the "Copy" button
**Then** the full Markdown text is copied to the clipboard using a textarea fallback (since Figma iframes do not support the Clipboard API), and a "Copied to clipboard" confirmation appears for 2 seconds

---

### US-7: Download extracted markdown as a .md file
- [x] **As a** designer,
**I want to** download the Markdown as a file,
**So that** I can save it directly to my project repo or documentation folder.

**Given** the extraction has completed
**When** I click the "Download" button
**Then** a `.md` file is downloaded with the filename derived from the section name (lowercased, spaces replaced with hyphens)

---

### US-8: Re-extract after changing selection
- [x] **As a** designer,
**I want to** refresh the extraction after selecting a different section,
**So that** I can extract multiple sections without reopening the plugin.

**Given** the plugin is open and showing a previous extraction
**When** I select a different section in Figma and click the "Refresh" button
**Then** the plugin re-runs extraction on the new selection and updates the preview, filename, and button states

---

## Error Handling

### US-9: Show error when no section is selected
- [x] **As a** designer,
**I want to** see a clear message when I have not selected a section,
**So that** I know what to do to use the plugin.

**Given** nothing is selected, or only non-Section nodes are selected
**When** the plugin runs
**Then** the preview shows "Select a section first" or "Selection must include a Section", the Copy and Download buttons are disabled, and the filename shows a dash

---

### US-10: Show error when sections contain no content
- [x] **As a** designer,
**I want to** be informed when selected sections have no extractable content,
**So that** I know the issue is empty sections, not a plugin bug.

**Given** a Section is selected but contains only decorative nodes (shapes, empty frames)
**When** the extraction runs
**Then** the preview shows "No content found in selected sections" and the export buttons remain disabled

---

## UI & Theming

### US-11: Toggle light/dark theme
- [x] **As a** designer,
**I want to** switch between light and dark mode in the plugin UI,
**So that** the plugin matches my Figma theme preference.

**Given** the plugin UI is open
**When** I click the theme toggle button
**Then** the UI switches between light and dark mode, and the preference persists via localStorage

---

### US-12: Access feedback and support links
- [x] **As a** designer,
**I want to** send feedback or tip the developer,
**So that** I can report issues or support ongoing development.

**Given** the plugin UI is open
**When** I click "Feedback"
**Then** a mailto link opens for keithbarneydesign@gmail.com
**When** I click "Buy me a coffee"
**Then** the Stripe payment link opens externally

---
