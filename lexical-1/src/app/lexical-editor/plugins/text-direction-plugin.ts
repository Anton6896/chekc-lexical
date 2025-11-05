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
    console.log('applyTextDirection called with:', direction);

    editor.update(() => {
        const selection = $getSelection();
        console.log('Selection:', selection);

        if ($isRangeSelection(selection)) {
            // Get all nodes in selection
            let nodes = selection.getNodes();
            console.log('Initial nodes:', nodes.length);

            // If no nodes, get the anchor node (where cursor is)
            if (nodes.length === 0) {
                const anchorNode = selection.anchor.getNode();
                if (anchorNode) {
                    nodes = [anchorNode];
                    console.log('Using anchor node');
                }
            }

            // Track which parent elements we've already processed
            const processedParents = new Set<string>();

            nodes.forEach((node) => {
                console.log('Processing node:', node.getType());

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

                console.log('Found parent:', parent?.getType());

                if (parent && $isElementNode(parent)) {
                    const parentKey = parent.getKey();

                    // Only process each parent once
                    if (!processedParents.has(parentKey)) {
                        processedParents.add(parentKey);

                        console.log('Setting direction to:', direction);
                        console.log('Current direction before:', parent.getDirection());

                        // Set the direction on the element
                        parent.setDirection(direction);

                        console.log('Direction after setting:', parent.getDirection());
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
