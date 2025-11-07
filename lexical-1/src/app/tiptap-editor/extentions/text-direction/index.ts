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
            defaultAlignment: 'ltr' as TextDirection,
        };
    },
});


export { TextDirectionExtension };
export type { TextDirection };

export default TextDirectionExtension;