import {
  LexicalEditor,
  $getSelection,
  $isRangeSelection,
  $isElementNode,
  FORMAT_ELEMENT_COMMAND,
  ElementFormatType,
  LexicalNode
} from 'lexical';

export type TextAlignment = 'left' | 'center' | 'right';

/**
 * Maps our TextAlignment to Lexical's ElementFormatType
 */
function toElementFormat(alignment: TextAlignment): ElementFormatType {
  return alignment as ElementFormatType;
}

/**
 * Applies text alignment to the paragraph/block containing the current selection
 * @param editor - The Lexical editor instance
 * @param alignment - The text alignment to apply ('left', 'center', or 'right')
 */
export function applyTextAlignment(editor: LexicalEditor, alignment: TextAlignment): void {
  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, toElementFormat(alignment));
}

/**
 * Gets the current text alignment of the selected block
 * @param selection - The current selection
 * @returns The current text alignment or 'left' as default
 */
export function getCurrentTextAlignment(selection: any): TextAlignment {
  if ($isRangeSelection(selection)) {
    const node = selection.anchor.getNode();
    let element: LexicalNode | null = node;

    // If the node itself is an element (like paragraph), use it
    if (!$isElementNode(element)) {
      element = node.getParent();
    }

    // Find the top-level block element
    while (element !== null && element.getParent() !== null && element.getParent()?.getType() !== 'root') {
      const parent = element.getParent();
      element = parent;
    }

    if (element && $isElementNode(element)) {
      const format = element.getFormat();

      // The format is returned as ElementFormatType which is a union of string literals
      // We need to handle it as a number or convert to string
      const formatNumber = typeof format === 'number' ? format : 0;

      // Check the numeric values: 1 = left, 2 = center, 3 = right, 4 = justify
      if (formatNumber === 2) {
        return 'center';
      }
      if (formatNumber === 3) {
        return 'right';
      }

      // Default to left for any other format
      return 'left';
    }
  }

  return 'left'; // Default alignment
}
