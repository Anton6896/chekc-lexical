import {
    LexicalEditor,
    $getSelection,
    $isRangeSelection,
    $isElementNode,
    LexicalNode
} from 'lexical';

export type TextDirection = 'ltr' | 'rtl';

/**
 * Applies text direction to the paragraph/block containing the current selection
 * @param editor - The Lexical editor instance
 * @param direction - The text direction to apply ('ltr' or 'rtl')
 */
export function applyTextDirection(editor: LexicalEditor, direction: TextDirection): void {
    editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
            // Get all nodes in selection
            let nodes = selection.getNodes();

            // If no nodes, get the anchor node (where cursor is)
            if (nodes.length === 0) {
                const anchorNode = selection.anchor.getNode();
                if (anchorNode) {
                    nodes = [anchorNode];
                }
            }

            // Track which parent elements we've already processed
            const processedParents = new Set<string>();

            nodes.forEach((node) => {
                // Get the parent element node (paragraph, heading, etc.)
                let parent: LexicalNode | null = node;

                // If the node itself is an element (like paragraph), use it
                if (!$isElementNode(parent)) {
                    parent = node.getParent();
                }

                // Find the top-level block element (direct child of root)
                while (parent !== null && parent.getParent() !== null && parent.getParent()?.getType() !== 'root') {
                    const nextParent = parent.getParent();
                    parent = nextParent;
                }

                if (parent && $isElementNode(parent)) {
                    const parentKey = parent.getKey();

                    // Only process each parent once
                    if (!processedParents.has(parentKey)) {
                        processedParents.add(parentKey);

                        // Set the direction on the element
                        parent.setDirection(direction);
                    }
                }
            });
        }
    });
    editor.focus();
}

/**
 * Gets the current text direction of the selected block
 * @param selection - The current selection
 * @returns The current text direction or 'ltr' as default
 */
export function getCurrentTextDirection(selection: any): TextDirection {
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
            const direction = element.getDirection();

            if (direction === 'rtl') {
                return 'rtl';
            }

            // Default to ltr for any other direction (including null, 'ltr')
            return 'ltr';
        }
    }

    return 'ltr'; // Default direction
}
