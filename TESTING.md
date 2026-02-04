# Heavy Documentation Extractor — User Stories

## Core: Extract Markdown

### US-1: Extract text hierarchy from a section
**As a** designer documenting components,
**I want to** extract content from a Figma section as markdown,
**So that** I get structured documentation with headings and body text.

**Given** a selected section containing nested frames with text
**When** I run the plugin
**Then** a markdown preview appears with headings matching frame names and body text from text nodes

---

### US-2: Heading depth follows nesting
**As a** designer with deeply nested documentation,
**I want** heading levels to reflect the nesting depth,
**So that** the markdown hierarchy matches the Figma structure.

**Given** a section > frame "Overview" > frame "Details" > text
**When** I extract
**Then** "Overview" is ## and "Details" is ###, capped at h6

---

### US-3: Extract from multiple selected sections
**As a** designer documenting several component groups,
**I want to** select multiple sections and extract them all at once,
**So that** I get a single combined markdown document.

**Given** two selected sections ("Buttons", "Inputs")
**When** I run the plugin
**Then** both sections are extracted into one markdown preview, separated by blank lines

---

### US-4: Component instances include metadata
**As a** designer using component instances in documentation,
**I want** instances to show their component name and variant properties,
**So that** the documentation captures which components are referenced.

**Given** a section containing an instance of "Button" with variant "Size: Large"
**When** I extract
**Then** the markdown includes `[Component: Button | Size: Large]`

---

## Core: Filtering

### US-5: Skip decorative elements
**As a** designer using decorative frames and shapes,
**I want** dividers, backgrounds, and shapes to be excluded,
**So that** only meaningful content appears in the markdown.

**Given** a section containing rectangles, lines, and a frame named "divider"
**When** I extract
**Then** none of these appear in the output

---

### US-6: Exact match on decorative frame names
**As a** designer with legitimately-named frames,
**I want** only exact decorative names to be skipped,
**So that** a frame named "background-info" is not incorrectly filtered out.

**Given** a section with frames "background" and "background-info"
**When** I extract
**Then** "background" is skipped but "background-info" appears as a heading

---

### US-7: Skip auto-generated frame names
**As a** designer,
**I want** frames named "Frame 1", "Frame 23", etc. to be treated as pass-through containers,
**So that** auto-layout wrappers don't clutter the headings.

**Given** a section containing "Frame 12" with text children
**When** I extract
**Then** no heading is created for "Frame 12" but its text content is included

---

## Core: Output

### US-8: Copy to clipboard
**As a** designer,
**I want to** copy the extracted markdown to my clipboard,
**So that** I can paste it into docs, READMEs, or wikis.

**Given** extracted markdown is showing in the preview
**When** I click Copy
**Then** the content is on my clipboard and a "Copied to clipboard" status appears

---

### US-9: Download as .md file
**As a** designer,
**I want to** download the markdown as a file,
**So that** I can commit it to a repo or share it.

**Given** extracted markdown from a section named "Button Docs"
**When** I click Download
**Then** a file named "button-docs.md" is downloaded

---

### US-10: Refresh extraction
**As a** designer iterating on documentation,
**I want to** re-extract after making changes in Figma,
**So that** I can see updated content without reopening the plugin.

**Given** I've already extracted and then modified the Figma section
**When** I click Refresh
**Then** the preview updates with the latest content

---

## Edge Cases

### US-11: No selection shows error
**As a** user,
**I want** a clear message if nothing is selected,
**So that** I know I need to select a section first.

**Given** nothing is selected on the canvas
**When** the plugin opens
**Then** the preview shows "Select a Figma Section"

---

### US-12: Selection without a section shows error
**As a** user who selected a frame instead of a section,
**I want** a clear message,
**So that** I know to select a section specifically.

**Given** only frames are selected (no sections)
**When** the plugin runs
**Then** an error message appears: "Selection must include a Section"
