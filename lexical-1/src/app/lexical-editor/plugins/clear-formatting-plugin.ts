import {
  LexicalEditor,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $isElementNode,
  ElementNode,
  FORMAT_TEXT_COMMAND
} from 'lexical';

/**
 * Clears all formatting from the current selection or cursor position
 * @param editor - The Lexical editor instance
 * @param currentFormats - Object containing current format states
 */
export function clearAllFormatting(
  editor: LexicalEditor,
  currentFormats: {
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
    isCode: boolean;
    isH1: boolean;
    isH2: boolean;
    isH3: boolean;
  }
): void {
  editor.update(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      // Clear text formatting (bold, italic, underline, etc.)
      if (currentFormats.isBold) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
      }
      if (currentFormats.isItalic) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
      }
      if (currentFormats.isUnderline) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
      }
      if (currentFormats.isStrikethrough) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
      }
      if (currentFormats.isCode) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
      }

      // Clear heading formats (h1, h2, h3)
      if (currentFormats.isH1) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
      }
      if (currentFormats.isH2) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
      }
      if (currentFormats.isH3) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
      }

      // Get all nodes in selection
      let nodes = selection.getNodes();
      if (nodes.length === 0) {
        const anchorNode = selection.anchor.getNode();
        if (anchorNode) {
          nodes = [anchorNode];
        }
      }

      // Process each node to clear styles and block-level formatting
      const processedParents = new Set<string>();

      nodes.forEach((node) => {
        // Clear inline styles (font size, font family, color) from text nodes
        if ($isTextNode(node)) {
          node.setStyle('');
        }

        // Get parent element for block-level clearing
        let parent = $isElementNode(node) ? node : node.getParent();

        // Find the top-level block element
        while (parent !== null && parent.getParent() !== null && parent.getParent()?.getType() !== 'root') {
          parent = parent.getParent();
        }

        if (parent && $isElementNode(parent)) {
          const parentKey = parent.getKey();

          if (!processedParents.has(parentKey)) {
            processedParents.add(parentKey);

            // Cast to ElementNode to access element-specific methods
            const elementParent = parent as ElementNode;

            // Reset text alignment to left
            elementParent.setFormat('left');

            // Reset text direction to ltr
            elementParent.setDirection('ltr');

            // Clear any inline styles on the element
            elementParent.setStyle('');
          }
        }
      });
    }
  });

  editor.focus();
}
