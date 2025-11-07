import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        placeholderToken: {
            insertPlaceholderToken: (label: string) => ReturnType;
        };
    }
}

const PlaceholderExtension = Node.create({
    name: 'placeholderToken',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            label: {
                default: 'token',
                parseHTML: (element) => element.getAttribute('data-placeholder-label') ?? 'token',
                renderHTML: (attributes) => ({
                    'data-placeholder-label': (attributes['label'] as string) ?? 'token',
                }),
            },
        };
    },

    // this is place holder to search for inner computing
    parseHTML() {
        return [
            {
                tag: 'span[data-placeholder-token]',
            },
        ];
    },

    renderHTML({ HTMLAttributes, node }) {
        const label = (node.attrs['label'] as string) ?? 'token';
        return [
            'span',
            mergeAttributes(
                {
                    'data-placeholder-token': '',
                    class: 'placeholder-token',
                    contenteditable: 'false',
                },
                HTMLAttributes,
            ),
            `{{ ${label} }}`,
        ];
    },

    addCommands() {
        return {
            insertPlaceholderToken:
                (label: string) =>
                    ({ chain }) => {
                        if (!label) {
                            return false;
                        }

                        return chain()
                            .focus()
                            .insertContent({
                                type: this.name,
                                attrs: { label },
                            })
                            .run();
                    },
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Shift-P': () => this.editor.commands.insertPlaceholderToken('placeholder'),
        };
    },
});

export default PlaceholderExtension;
