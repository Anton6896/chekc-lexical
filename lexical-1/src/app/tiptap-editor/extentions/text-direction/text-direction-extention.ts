import { Extension } from '@tiptap/core';

type TextDirection = 'rtl' | 'ltr';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textDirectionExtension: {
            setTextDirection: (direction: TextDirection) => ReturnType;
            unsetTextDirection: () => ReturnType;
        };
    }
}

const TextDirectionExtension = Extension.create({
    name: 'TextDirection',

    addOptions() {
        return {
            types: ['heading', 'paragraph'] as string[],
            directions: ['rtl', 'ltr'] as TextDirection[],
            defaultDirection: 'ltr' as TextDirection,
        };
    },

    addGlobalAttributes() {
        const { types, defaultDirection } = this.options;

        return [
            {
                types,
                attributes: {
                    textDirection: {
                        default: defaultDirection,
                        renderHTML: (attributes: { textDirection?: TextDirection; }) => {
                            const dir = attributes.textDirection || defaultDirection;

                            if (dir === defaultDirection) {
                                return {};
                            }

                            return { style: `direction: ${dir}` };
                        },
                        parseHTML: (element: HTMLElement) =>
                            (element.style.direction || defaultDirection) as TextDirection,
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setTextDirection:
                (direction: TextDirection) =>
                    ({ commands }) => {
                        if (!this.options.directions.includes(direction)) {
                            return false;
                        }

                        const updated = this.options.types.map((type: string) =>
                            commands.updateAttributes(type, { textDirection: direction })
                        );

                        return updated.some(Boolean);
                    },
            unsetTextDirection:
                () =>
                    ({ commands }) => {
                        const reset = this.options.types.map((type: string) =>
                            commands.updateAttributes(type, { textDirection: this.options.defaultDirection })
                        );

                        return reset.some(Boolean);
                    },
        };
    },
});


export { TextDirectionExtension };
export type { TextDirection };

export default TextDirectionExtension;