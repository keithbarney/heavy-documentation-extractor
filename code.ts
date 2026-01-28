// Heavy Documentation Extractor — Figma Plugin
// Extracts content from selected section, preserves hierarchy based on nesting depth

// Decorative frame names to skip
var SKIP_FRAME_NAMES = [
  'spacer', 'divider', 'background', 'bg', 'separator', 'line', 'rule'
];

// Check if a frame name should be skipped (decorative)
function isDecorativeFrame(name: string): boolean {
  var lower = name.toLowerCase().trim();
  for (var i = 0; i < SKIP_FRAME_NAMES.length; i++) {
    if (lower === SKIP_FRAME_NAMES[i] || lower.indexOf(SKIP_FRAME_NAMES[i]) === 0) {
      return true;
    }
  }
  return false;
}

// Check if node is purely decorative (no semantic content)
function isDecorativeNode(node: SceneNode): boolean {
  // Skip shapes with no children (rectangles, ellipses, lines, vectors)
  if (node.type === 'RECTANGLE' ||
      node.type === 'ELLIPSE' ||
      node.type === 'LINE' ||
      node.type === 'VECTOR' ||
      node.type === 'STAR' ||
      node.type === 'POLYGON' ||
      node.type === 'BOOLEAN_OPERATION') {
    return true;
  }
  return false;
}

// Extract variant properties from a component instance
function getComponentMetadata(node: InstanceNode): string {
  var name = node.name || 'Unknown';

  // Get the main component name if available
  if (node.mainComponent) {
    var mainName = node.mainComponent.name;
    if (mainName) {
      name = mainName;
    }
  }

  // Collect variant properties
  var props: string[] = [];
  if (node.variantProperties) {
    for (var key in node.variantProperties) {
      if (node.variantProperties.hasOwnProperty(key)) {
        var value = node.variantProperties[key];
        if (value) {
          props.push(key + ': ' + value);
        }
      }
    }
  }

  if (props.length > 0) {
    return '[Component: ' + name + ' | ' + props.join(', ') + ']';
  }
  return '[Component: ' + name + ']';
}

// Recursively extract markdown, preserving parent-child relationships
function extractMarkdownFromNode(node: SceneNode, depth: number): string[] {
  var lines: string[] = [];

  // Skip decorative nodes entirely
  if (isDecorativeNode(node)) {
    return lines;
  }

  // Handle component instances - capture metadata
  if (node.type === 'INSTANCE') {
    var metadata = getComponentMetadata(node);
    lines.push(metadata);
    lines.push('');

    // Still recurse into instance children for any text content
    if ('children' in node) {
      var childDepth = depth;
      var sortedChildren = node.children.slice().sort(function(a, b) {
        var yDiff = a.absoluteTransform[1][2] - b.absoluteTransform[1][2];
        if (Math.abs(yDiff) < 5) {
          return a.absoluteTransform[0][2] - b.absoluteTransform[0][2];
        }
        return yDiff;
      });

      for (var i = 0; i < sortedChildren.length; i++) {
        var childLines = extractMarkdownFromNode(sortedChildren[i], childDepth);
        for (var j = 0; j < childLines.length; j++) {
          lines.push(childLines[j]);
        }
      }
    }
    return lines;
  }

  // Sections and frames with names become headings
  if (node.type === 'SECTION' || node.type === 'FRAME') {
    var name = node.name ? node.name.trim() : '';

    // Skip decorative frames and auto-generated names
    var shouldSkipName = !name ||
                         name.match(/^Frame \d+$/i) ||
                         isDecorativeFrame(name);

    if (!shouldSkipName) {
      var level = Math.min(depth + 1, 6); // Cap at h6
      var prefix = '#'.repeat(level) + ' ';
      lines.push(prefix + name);
      lines.push('');
    }
  }

  // Groups - just pass through, don't create headings
  // (Groups are organizational, not semantic)

  // Text nodes become body content (no trailing blank line - let paragraphs flow)
  if (node.type === 'TEXT') {
    var text = node.characters ? node.characters.trim() : '';
    if (text) {
      lines.push(text);
    }
  }

  // Recurse into children, sorted by position within parent
  if ('children' in node) {
    var childDepth = (node.type === 'SECTION' || node.type === 'FRAME') ? depth + 1 : depth;

    // Sort children by Y position (top to bottom), then X (left to right)
    var sortedChildren = node.children.slice().sort(function(a, b) {
      var yDiff = a.absoluteTransform[1][2] - b.absoluteTransform[1][2];
      if (Math.abs(yDiff) < 5) {
        return a.absoluteTransform[0][2] - b.absoluteTransform[0][2];
      }
      return yDiff;
    });

    for (var i = 0; i < sortedChildren.length; i++) {
      var childLines = extractMarkdownFromNode(sortedChildren[i], childDepth);
      for (var j = 0; j < childLines.length; j++) {
        lines.push(childLines[j]);
      }
    }
  }

  return lines;
}

// Main plugin logic
figma.showUI(__html__, { width: 480, height: 400 });

function extractMarkdown() {
  var selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({ type: 'error', message: 'Select a section first' });
    return;
  }

  var section = selection.find(function(node) { return node.type === 'SECTION'; });

  if (!section) {
    figma.ui.postMessage({ type: 'error', message: 'Selection must include a Section' });
    return;
  }

  // Start at depth 0 for the selected section
  var lines = extractMarkdownFromNode(section, 0);

  if (lines.length === 0) {
    figma.ui.postMessage({ type: 'error', message: 'No content found in section' });
    return;
  }

  var markdown = lines.join('\n').trim();
  var sectionName = section.name || 'section';

  figma.ui.postMessage({
    type: 'markdown',
    content: markdown,
    filename: sectionName.toLowerCase().replace(/\s+/g, '-') + '.md'
  });
}

// Listen for UI messages
figma.ui.onmessage = function(msg) {
  if (msg.type === 'extract') {
    extractMarkdown();
  }
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Run extraction on load
extractMarkdown();
