// Heavy Documentation Extractor — Figma Plugin v1.2.0
// Extracts content from selected sections, preserves hierarchy based on nesting depth
// Supports Markdown, JSON, and HTML export formats

// ─── Types ───────────────────────────────────────────────────────────────────

type ExportFormat = 'markdown' | 'json' | 'html';

interface ExtractionStats {
  headings: number;
  textNodes: number;
  components: number;
  skipped: number;
}

interface ExtractedItem {
  kind: 'heading' | 'text' | 'component' | 'listitem';
  level?: number; // 1–6 for headings
  text: string;
  children?: ExtractedItem[];
  componentName?: string;
  variants?: Record<string, string>;
}

interface ExtractedSection {
  name: string;
  items: ExtractedItem[];
}

// ─── Decorative detection ─────────────────────────────────────────────────────

const SKIP_FRAME_NAMES = [
  'spacer', 'divider', 'background', 'bg', 'separator',
  'line', 'rule', 'hr', 'decoration', 'ornament'
];

function isDecorativeFrame(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return SKIP_FRAME_NAMES.indexOf(lower) !== -1;
}

function isDecorativeNode(node: SceneNode): boolean {
  return (
    node.type === 'RECTANGLE' ||
    node.type === 'ELLIPSE' ||
    node.type === 'LINE' ||
    node.type === 'VECTOR' ||
    node.type === 'STAR' ||
    node.type === 'POLYGON' ||
    node.type === 'BOOLEAN_OPERATION'
  );
}

// ─── Text style helpers ───────────────────────────────────────────────────────

/** Wrap text with markdown bold/italic markers based on node font style */
function applyTextStyle(node: TextNode): string {
  const raw = node.characters ? node.characters.trim() : '';
  if (!raw) return '';

  try {
    const weight = node.fontWeight;
    const fontName = node.fontName;

    // If mixed (multiple styles), return plain — don't guess
    if (weight === figma.mixed || fontName === figma.mixed) {
      return raw;
    }

    const typedName = fontName as FontName;
    const typedWeight = weight as number;
    const styleLower = typedName.style.toLowerCase();

    const isBold = typedWeight >= 600 || styleLower.includes('bold');
    const isItalic = styleLower.includes('italic') || styleLower.includes('oblique');

    if (isBold && isItalic) return `***${raw}***`;
    if (isBold) return `**${raw}**`;
    if (isItalic) return `*${raw}*`;
    return raw;
  } catch {
    return raw;
  }
}

/** Detect if a text node looks like a heading (large/prominent font) */
function isHeadingStyle(node: TextNode, depth: number): boolean {
  try {
    const size = node.fontSize;
    if (size === figma.mixed) return false;
    const typedSize = size as number;
    // Treat text as heading-like if font is ≥18px and depth is low
    return depth <= 2 && typedSize >= 18;
  } catch {
    return false;
  }
}

// ─── Component metadata ───────────────────────────────────────────────────────

async function getComponentInfo(node: InstanceNode): Promise<{ name: string; variants: Record<string, string> }> {
  let name = node.name || 'Unknown';

  try {
    const mainComponent = await node.getMainComponentAsync();
    if (mainComponent && mainComponent.name) {
      // Strip variant suffix from component set names (e.g. "Button/Size=Large" → "Button")
      name = mainComponent.name.split('/')[0].trim();
    }
  } catch {
    // Async access failed — use instance name
  }

  const variants: Record<string, string> = {};
  if (node.variantProperties) {
    for (const key in node.variantProperties) {
      if (Object.prototype.hasOwnProperty.call(node.variantProperties, key)) {
        const value = node.variantProperties[key];
        if (value) variants[key] = value;
      }
    }
  }

  return { name, variants };
}

// ─── Sorted children ──────────────────────────────────────────────────────────

function sortedChildren(node: ChildrenMixin): readonly SceneNode[] {
  return node.children.slice().sort((a, b) => {
    const yDiff = a.absoluteTransform[1][2] - b.absoluteTransform[1][2];
    if (Math.abs(yDiff) < 5) {
      return a.absoluteTransform[0][2] - b.absoluteTransform[0][2];
    }
    return yDiff;
  });
}

// ─── Core extraction ──────────────────────────────────────────────────────────

async function extractItems(
  node: SceneNode,
  depth: number,
  stats: ExtractionStats
): Promise<ExtractedItem[]> {
  const items: ExtractedItem[] = [];

  if (isDecorativeNode(node)) {
    stats.skipped++;
    return items;
  }

  // Sticky notes
  if (node.type === 'STICKY') {
    const text = (node as StickyNode).text?.characters?.trim();
    if (text) {
      stats.textNodes++;
      items.push({ kind: 'text', text: `> ${text}` }); // Render as blockquote
    }
    return items;
  }

  // Component instances
  if (node.type === 'INSTANCE') {
    const { name, variants } = await getComponentInfo(node);
    stats.components++;
    items.push({ kind: 'component', text: name, componentName: name, variants });

    // Recurse into instance children for text content
    if ('children' in node) {
      for (const child of sortedChildren(node)) {
        const childItems = await extractItems(child, depth, stats);
        items.push(...childItems);
      }
    }
    return items;
  }

  // Sections and named frames → headings
  if (node.type === 'SECTION' || node.type === 'FRAME') {
    const name = node.name ? node.name.trim() : '';
    const shouldSkipName = !name || /^Frame \d+$/i.test(name) || isDecorativeFrame(name);

    let headingItem: ExtractedItem | null = null;
    if (!shouldSkipName) {
      const level = Math.min(depth + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6;
      stats.headings++;
      headingItem = { kind: 'heading', level, text: name, children: [] };
      items.push(headingItem);
    }

    if ('children' in node) {
      const childDepth = depth + 1;
      for (const child of sortedChildren(node)) {
        const childItems = await extractItems(child, childDepth, stats);
        if (headingItem && headingItem.children) {
          headingItem.children.push(...childItems);
        } else {
          items.push(...childItems);
        }
      }
    }
    return items;
  }

  // Groups — pass-through
  if (node.type === 'GROUP') {
    if ('children' in node) {
      for (const child of sortedChildren(node)) {
        const childItems = await extractItems(child, depth, stats);
        items.push(...childItems);
      }
    }
    return items;
  }

  // Text nodes
  if (node.type === 'TEXT') {
    const styledText = applyTextStyle(node);
    if (styledText) {
      // Promote large text at low depth to heading-like
      if (isHeadingStyle(node, depth)) {
        const level = Math.min(depth + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6;
        stats.headings++;
        items.push({ kind: 'heading', level, text: styledText });
      } else {
        stats.textNodes++;
        items.push({ kind: 'text', text: styledText });
      }
    }
    return items;
  }

  // Other container types (component sets, etc.)
  if ('children' in node) {
    for (const child of sortedChildren(node as SceneNode & ChildrenMixin)) {
      const childItems = await extractItems(child, depth, stats);
      items.push(...childItems);
    }
  }

  return items;
}

// ─── Markdown rendering ───────────────────────────────────────────────────────

function renderItemsToMarkdown(items: ExtractedItem[]): string[] {
  const lines: string[] = [];

  for (const item of items) {
    if (item.kind === 'heading') {
      lines.push('#'.repeat(item.level ?? 1) + ' ' + item.text);
      lines.push('');
      if (item.children && item.children.length > 0) {
        const childLines = renderItemsToMarkdown(item.children);
        lines.push(...childLines);
      }
    } else if (item.kind === 'component') {
      const variantParts = Object.entries(item.variants ?? {}).map(([k, v]) => `${k}: ${v}`);
      if (variantParts.length > 0) {
        lines.push(`[Component: ${item.componentName} | ${variantParts.join(', ')}]`);
      } else {
        lines.push(`[Component: ${item.componentName}]`);
      }
      lines.push('');
    } else if (item.kind === 'text') {
      lines.push(item.text);
    }
  }

  return lines;
}

function cleanMarkdown(lines: string[]): string {
  // Collapse consecutive blank lines to a single blank line
  const cleaned: string[] = [];
  let prevBlank = false;
  for (const line of lines) {
    const isBlank = line.trim() === '';
    if (isBlank && prevBlank) continue;
    cleaned.push(line);
    prevBlank = isBlank;
  }
  return cleaned.join('\n').trim();
}

// ─── JSON rendering ───────────────────────────────────────────────────────────

function renderItemsToJSON(
  sectionName: string,
  items: ExtractedItem[],
  stats: ExtractionStats
): string {
  const payload = {
    version: '1.2.0',
    extracted: new Date().toISOString().slice(0, 10),
    section: sectionName,
    stats: {
      headings: stats.headings,
      textNodes: stats.textNodes,
      components: stats.components,
    },
    content: items,
  };
  return JSON.stringify(payload, null, 2);
}

// ─── HTML rendering ───────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function markdownInlineToHtml(text: string): string {
  // Convert ***bold italic***, **bold**, *italic*, > blockquote prefix
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function renderItemsToHtmlParts(items: ExtractedItem[]): string[] {
  const parts: string[] = [];

  for (const item of items) {
    if (item.kind === 'heading') {
      const lvl = item.level ?? 1;
      const escaped = escapeHtml(item.text);
      parts.push(`<h${lvl}>${escaped}</h${lvl}>`);
      if (item.children && item.children.length > 0) {
        parts.push(...renderItemsToHtmlParts(item.children));
      }
    } else if (item.kind === 'component') {
      const variantParts = Object.entries(item.variants ?? {}).map(
        ([k, v]) => `<span class="variant-key">${escapeHtml(k)}</span>: <span class="variant-val">${escapeHtml(v)}</span>`
      );
      const inner = variantParts.length > 0
        ? `<span class="component-name">${escapeHtml(item.componentName ?? '')}</span> &mdash; ${variantParts.join(', ')}`
        : `<span class="component-name">${escapeHtml(item.componentName ?? '')}</span>`;
      parts.push(`<p class="component-ref">[Component: ${inner}]</p>`);
    } else if (item.kind === 'text') {
      if (item.text.startsWith('> ')) {
        parts.push(`<blockquote><p>${markdownInlineToHtml(escapeHtml(item.text.slice(2)))}</p></blockquote>`);
      } else {
        parts.push(`<p>${markdownInlineToHtml(escapeHtml(item.text))}</p>`);
      }
    }
  }

  return parts;
}

function renderItemsToHtml(sectionName: string, items: ExtractedItem[]): string {
  const bodyParts = renderItemsToHtmlParts(items);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(sectionName)}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 760px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }
  h1,h2,h3,h4,h5,h6 { margin: 1.5rem 0 0.5rem; font-weight: 600; }
  p { margin: 0 0 0.75rem; }
  blockquote { border-left: 3px solid #ccc; margin: 0.75rem 0; padding: 0.5rem 1rem; color: #555; }
  .component-ref { color: #666; font-size: 0.9em; font-family: monospace; }
  .component-name { font-weight: bold; }
  strong { font-weight: 600; }
  em { font-style: italic; }
</style>
</head>
<body>
${bodyParts.join('\n')}
</body>
</html>`;
}

// ─── Main extraction ──────────────────────────────────────────────────────────

figma.showUI(__html__, { width: 520, height: 460 });

async function runExtraction(format: ExportFormat = 'markdown') {
  // Signal loading state
  figma.ui.postMessage({ type: 'loading' });

  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({ type: 'error', message: 'Select a Section first' });
    return;
  }

  const sections = selection.filter(n => n.type === 'SECTION');

  if (sections.length === 0) {
    figma.ui.postMessage({ type: 'error', message: 'Selection must include a Section' });
    return;
  }

  const stats: ExtractionStats = { headings: 0, textNodes: 0, components: 0, skipped: 0 };
  const allSections: ExtractedSection[] = [];

  for (const section of sections) {
    const items = await extractItems(section, 0, stats);
    allSections.push({ name: section.name || 'section', items });
  }

  if (allSections.every(s => s.items.length === 0)) {
    figma.ui.postMessage({ type: 'error', message: 'No content found in selected sections' });
    return;
  }

  const sectionName = sections.length === 1
    ? (sections[0].name || 'section')
    : 'combined-sections';

  const filenameBase = sectionName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  let content: string;
  let filename: string;

  if (format === 'json') {
    // Merge all sections for JSON
    const mergedItems = allSections.flatMap((s, i) => {
      const result: ExtractedItem[] = s.items;
      return result;
    });
    content = renderItemsToJSON(sectionName, mergedItems, stats);
    filename = `${filenameBase}.json`;
  } else if (format === 'html') {
    const mergedItems = allSections.flatMap(s => s.items);
    content = renderItemsToHtml(sectionName, mergedItems);
    filename = `${filenameBase}.html`;
  } else {
    // Default: markdown
    const allLines: string[] = [];
    for (let i = 0; i < allSections.length; i++) {
      const mdLines = renderItemsToMarkdown(allSections[i].items);
      allLines.push(...mdLines);
      if (i < allSections.length - 1 && mdLines.length > 0) {
        allLines.push('');
        allLines.push('---');
        allLines.push('');
      }
    }
    content = cleanMarkdown(allLines);
    filename = `${filenameBase}.md`;
  }

  figma.ui.postMessage({
    type: 'result',
    format,
    content,
    filename,
    stats,
  });
}

// ─── Message listener ─────────────────────────────────────────────────────────

figma.ui.onmessage = function (msg: { type: string; format?: ExportFormat; url?: string }) {
  if (msg.type === 'extract') {
    runExtraction(msg.format ?? 'markdown');
  }
  if (msg.type === 'close') {
    figma.closePlugin();
  }
  if (msg.type === 'open-url' && msg.url) {
    figma.openExternal(msg.url);
  }
};

// Run on load with markdown format
runExtraction('markdown');
