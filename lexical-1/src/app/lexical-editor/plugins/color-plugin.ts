import { LexicalEditor, $getSelection, $isRangeSelection, $isTextNode, $createTextNode } from 'lexical';

/**
 * Color Plugin for Lexical Editor
 * Provides text color functionality that applies to selected text only
 */

/**
 * Helper function to convert RGB color values to Hex format
 * @param rgb - RGB color string (e.g., "rgb(255, 0, 0)" or "#ff0000")
 * @returns Hex color string (e.g., "#ff0000")
 */
export function rgbToHex(rgb: string): string {
  // If it's already a hex color, return it
  if (rgb.startsWith('#')) {
    return rgb;
  }

  // Parse rgb(r, g, b) format
  const rgbMatch = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // Default to black if we can't parse
  return '#000000';
}

/**
 * Apply text color to the currently selected text in the editor
 * @param editor - The Lexical editor instance
 * @param color - The color to apply (hex format, e.g., "#ff0000")
 */
export function applyTextColor(editor: LexicalEditor, color: string): void {
  if (!editor) return;

  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    // Check if selection is collapsed (no text selected)
    if (selection.isCollapsed()) {
      return;
    }

    // Get the selected text nodes
    const nodes = selection.getNodes();
    const anchorOffset = selection.anchor.offset;
    const focusOffset = selection.focus.offset;

    nodes.forEach((node, index) => {
      if ($isTextNode(node)) {
        const isFirst = index === 0;
        const isLast = index === nodes.length - 1;

        // If this is a partial selection within a text node
        if (isFirst || isLast) {
          const textContent = node.getTextContent();

          // Determine the actual selection boundaries for this node
          let startOffset = 0;
          let endOffset = textContent.length;

          if (isFirst && node.getKey() === selection.anchor.getNode().getKey()) {
            startOffset = anchorOffset;
          }
          if (isLast && node.getKey() === selection.focus.getNode().getKey()) {
            endOffset = focusOffset;
          }

          // Normalize offsets if selection is backwards
          const actualStart = Math.min(startOffset, endOffset);
          const actualEnd = Math.max(startOffset, endOffset);

          // If we're selecting only part of this node, we need to split it
          if (actualStart > 0 || actualEnd < textContent.length) {
            // Split the text node into parts
            const beforeText = textContent.substring(0, actualStart);
            const selectedText = textContent.substring(actualStart, actualEnd);
            const afterText = textContent.substring(actualEnd);

            if (selectedText) {
              // Create a new text node for the selected portion
              const selectedNode = $createTextNode(selectedText);

              // Copy formats from original node
              if (node.hasFormat('bold')) selectedNode.toggleFormat('bold');
              if (node.hasFormat('italic')) selectedNode.toggleFormat('italic');
              if (node.hasFormat('underline')) selectedNode.toggleFormat('underline');
              if (node.hasFormat('strikethrough')) selectedNode.toggleFormat('strikethrough');
              if (node.hasFormat('code')) selectedNode.toggleFormat('code');

              // Apply the new text color
              let style = node.getStyle();
              style = style.replace(/color:\s*[^;]+;?\s*/g, '');
              style = style ? `${style}; color: ${color}` : `color: ${color}`;
              selectedNode.setStyle(style.trim());

              // Replace or insert nodes
              if (beforeText && afterText) {
                // Split into 3 parts: before, selected, after
                const afterNode = $createTextNode(afterText);
                if (node.hasFormat('bold')) afterNode.toggleFormat('bold');
                if (node.hasFormat('italic')) afterNode.toggleFormat('italic');
                if (node.hasFormat('underline')) afterNode.toggleFormat('underline');
                if (node.hasFormat('strikethrough')) afterNode.toggleFormat('strikethrough');
                if (node.hasFormat('code')) afterNode.toggleFormat('code');
                const originalStyle = node.getStyle();
                if (originalStyle) afterNode.setStyle(originalStyle);

                node.setTextContent(beforeText);
                node.insertAfter(selectedNode);
                selectedNode.insertAfter(afterNode);
              } else if (beforeText) {
                // Only before and selected
                node.setTextContent(beforeText);
                node.insertAfter(selectedNode);
              } else if (afterText) {
                // Only selected and after
                const afterNode = $createTextNode(afterText);
                if (node.hasFormat('bold')) afterNode.toggleFormat('bold');
                if (node.hasFormat('italic')) afterNode.toggleFormat('italic');
                if (node.hasFormat('underline')) afterNode.toggleFormat('underline');
                if (node.hasFormat('strikethrough')) afterNode.toggleFormat('strikethrough');
                if (node.hasFormat('code')) afterNode.toggleFormat('code');
                const originalStyle = node.getStyle();
                if (originalStyle) afterNode.setStyle(originalStyle);

                node.replace(selectedNode);
                selectedNode.insertAfter(afterNode);
              } else {
                // Entire node is selected
                node.replace(selectedNode);
              }
            }
            return;
          }
        }

        // If entire node is selected, just update its style
        let style = node.getStyle();
        style = style.replace(/color:\s*[^;]+;?\s*/g, '');
        style = style ? `${style}; color: ${color}` : `color: ${color}`;
        node.setStyle(style.trim());
      }
    });
  });
  editor.focus();
}

/**
 * Get the current text color from the selected text
 * @param editor - The Lexical editor instance
 * @returns The current text color in hex format, or '#000000' if no color is set
 */
export function getCurrentTextColor(editor: LexicalEditor): string {
  let currentColor = '#000000';

  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = selection.anchor.getNode();
      if ($isTextNode(node)) {
        const style = node.getStyle();
        const colorMatch = style.match(/color:\s*([^;]+)/);
        if (colorMatch) {
          currentColor = rgbToHex(colorMatch[1].trim());
        }
      }
    }
  });

  return currentColor;
}
