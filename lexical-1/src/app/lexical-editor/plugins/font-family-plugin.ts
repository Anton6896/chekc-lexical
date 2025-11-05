import { LexicalEditor, $getSelection, $isRangeSelection, $isTextNode, $createTextNode } from 'lexical';

/**
 * Applies a font family to the currently selected text in the editor
 * @param editor - The Lexical editor instance
 * @param fontFamily - The font family to apply (e.g., 'Arial', 'Times New Roman')
 */
export function applyFontFamily(editor: LexicalEditor, fontFamily: string): void {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
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

                                // Apply the new font family
                                let style = node.getStyle();
                                style = style.replace(/font-family:\s*[^;]+;?\s*/g, '');
                                style = style ? `${style}; font-family: ${fontFamily}` : `font-family: ${fontFamily}`;
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
                    style = style.replace(/font-family:\s*[^;]+;?\s*/g, '');
                    style = style ? `${style}; font-family: ${fontFamily}` : `font-family: ${fontFamily}`;
                    node.setStyle(style.trim());
                }
            });
        }
    });
    editor.focus();
}
