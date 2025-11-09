import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        checkBoxToken: {
            insertCheckBoxToken: (
                checkBoxId: string,
                selected: boolean
            ) => ReturnType;
        };
    }
}

const DEFAULT_ID = 'token';

const CheckBoxExtension = Node.create({
    name: 'checkBoxToken',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            checkBoxId: {
                default: DEFAULT_ID,
                parseHTML: (element) => element.getAttribute('data-checkBoxToken-id') ?? DEFAULT_ID,
                renderHTML: (attributes) => ({
                    'data-checkBoxToken-id': (attributes['checkBoxId'] as string) ?? DEFAULT_ID,
                }),
            },
            selected: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-checkBoxToken-selected') === 'true',
                renderHTML: (attributes) => ({
                    'data-checkBoxToken-selected': (attributes['selected'] ? 'true' : 'false'),
                }),
            }
        };
    },

    // this is place holder to search for inner computing
    parseHTML() {
        return [
            {
                tag: 'input[data-checkBoxToken]',
            },
        ];
    },

    renderHTML({ HTMLAttributes, node }) {
        const checkBoxId = (node.attrs['checkBoxId'] as string) ?? DEFAULT_ID;
        const selected = Boolean(node.attrs['selected']);

        const data: Record<string, string> = {
            'data-checkBoxToken': '',
            'data-checkBoxToken-id': checkBoxId,
            'data-checkBoxToken-selected': selected ? 'true' : 'false',
            class: 'cs4-checkBoxToken',
            contenteditable: 'false',
            type: 'checkbox',
            name: checkBoxId
        };

        if (selected) {
            data["checked"] = 'checked';
        }

        return ['input', mergeAttributes(data, HTMLAttributes)];
    },

    addCommands() {
        return {
            insertCheckBoxToken:
                (checkBoxId: string, selected: boolean) =>
                    ({ chain }) => {
                        const normalizedId = checkBoxId || DEFAULT_ID;
                        const isSelected = Boolean(selected);

                        return chain()
                            .focus()
                            .insertContent({
                                type: this.name,
                                attrs: { checkBoxId: normalizedId, selected: isSelected },
                            })
                            .run();
                    },
        };
    },
});


export default CheckBoxExtension;