import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import FontSize from './extentions/font-size/font-size-extension';
import { TiptapBubbleMenuDirective, TiptapEditorDirective } from 'ngx-tiptap';
import type { Level } from '@tiptap/extension-heading';
import TextAlignExtension, { type TextAlign, } from './extentions/tiptap-text-aligin-extension';
import TextDirectionExtension, { type TextDirection } from './extentions/text-direction/text-direction-extention';
import PlaceholderExtension from './extentions/placeholder/placeholder-extention';

type NgxBubbleMenuShouldShowProps = {
  editor: Editor;
  element: HTMLElement;
  view: Editor['view'];
  state: Editor['state'];
  oldState?: Editor['state'];
  from: number;
  to: number;
  pluginKey?: string;
};


const sampleText = `<h3 style="text-align: center;">Lorem ipsum dolor sit amet,</h3><p><strong>consectetur adipiscing elit. Aliquam odio nibh, accumsan eget semper</strong> ac, tempor pulvinar risus. Proin nibh dolor, commodo sit amet tincidunt at, pretium ac erat. Donec congue lorem sem, tincidunt maximus lorem iaculis pharetra. Curabitur eget dictum ligula. Maecenas a rutrum dui, sit amet suscipit dui. <span style="font-size: 20px;">Nam ut velit rhoncus ligula</span></p><ul><li><p><span style="color: rgb(223, 42, 42);">fringilla sagittis vitae sit amet lorem.</span></p><ul><li><p><mark data-color="#f2f25a" style="background-color: rgb(242, 242, 90); color: inherit;">Suspendisse efficitur placerat est eu porta.</mark></p><ul><li><p><span style="font-family: &quot;Courier New&quot;, monospace;">Nulla non mauris sit amet justo <em>tristique aliquam</em>. Integer sed orci eu ipsum <strong>sagittis elementum </strong>ut id enim. Donec posuere enim a interdum gravida. Quisque eu turpis vitae dui blandit facilisis. Nullam s<s>ollicitudin fermentum commodo</s>.</span><br></p></li></ul></li></ul></li></ul><p><span style="font-family: Georgia, serif;">Maecenas feugiat et ipsum et tempor. Nulla dictum euismod ligula, vel cursus dolor sollicitudin eget. Morbi risus urna, congue et lorem vitae,</span></p><ol><li><p><span style="font-family: Verdana, sans-serif;">vehicula tristique mauris.</span></p><ol><li><p><span style="font-family: Verdana, sans-serif;">Nullam felis massa, gravida a tempor vitae, faucibus ac est. Curabitur congue, felis a</span></p></li></ol></li></ol><p style="text-align: right; direction: rtl;">לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית גולר מונפרר סוברט לורם שבצק יהול, לכנוץ בעריר גק ליץ, ושבעגט ליבם סולגק. בראיט ולחת צורק מונחף, בגורמי מגמש. תרבנך וסתעד לכנו סתשם השמה - לתכי מורגם בורק? לתיג ישבעס.</p><p><img src="data:image/png;base64,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"> What is this image ?</p>`;

@Component({
  selector: 'app-tiptap-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TiptapEditorDirective,
    TiptapBubbleMenuDirective,
  ],
  templateUrl: './tiptap-editor.component.html',
  styleUrls: ['./tiptap-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiptapEditorComponent implements OnInit, OnDestroy {
  editor!: Editor;

  content = sampleText;
  htmlOutput = this.content;
  readonly alignments: TextAlign[] = ['left', 'center', 'right', 'justify'];
  readonly defaultAlignment: TextAlign = 'left';

  readonly textDirection: TextDirection[] = ['rtl', 'ltr'];
  readonly defaultTextDirection: TextDirection = 'rtl';

  readonly fontFamilies = [
    { name: 'Default', value: '' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
  ];

  readonly colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#808080', '#FFC0CB',
  ];

  readonly highlightColors = [
    'transparent', '#FFFF00', '#00FF00', '#00FFFF',
    '#FF00FF', '#FFA500', '#FFB6C1', '#90EE90',
  ];

  readonly fontSizes = [
    { name: 'Small', value: '12px' },
    { name: 'Normal', value: '16px' },
    { name: 'Large', value: '20px' },
    { name: 'X-Large', value: '24px' },
    { name: 'XX-Large', value: '32px' },
  ];

  currentFontFamily: string = '';
  currentFontSize: string = '16px';
  currentTextColor: string = '#000000';
  currentHighlightColor: string = 'transparent';

  readonly bubbleMenuShouldShow = ({ editor, state }: NgxBubbleMenuShouldShowProps): boolean => {
    if (!editor || !editor.isEditable) {
      return false;
    }

    if (editor.isActive('placeholderToken')) {
      return false;
    }

    return !state.selection.empty;
  };

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.editor = new Editor({
      extensions: [
        StarterKit.configure({
          bulletList: { keepMarks: true },
          orderedList: { keepMarks: true },
        }),
        TextStyle,
        FontFamily.configure({
          types: ['textStyle'],
        }),
        FontSize.configure({
          types: ['textStyle'],
        }),
        Color.configure({
          types: ['textStyle'],
        }),
        Highlight.configure({
          multicolor: true,
        }),
        Image.configure({
          inline: true,
          allowBase64: true,
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: { class: 'cs-4-custom-table-class' },
        }),
        TableRow,
        TableHeader,
        TableCell,
        TextAlignExtension,
        TextDirectionExtension,
        PlaceholderExtension,
      ],
      content: this.content,
      onUpdate: ({ editor }) => {
        this.htmlOutput = editor.getHTML();
        this.content = this.htmlOutput;
        this.updateToolbarState();
        this.cdr.markForCheck();
      },
      onSelectionUpdate: ({ editor }) => {
        this.updateToolbarState();
        this.cdr.markForCheck();
      },
      editorProps: {
        attributes: {
          class: 'tiptap-editor',
        },
      },
    });
  }

  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleStrike(): void {
    this.editor?.chain().focus().toggleStrike().run();
  }

  toggleCode(): void {
    this.editor?.chain().focus().toggleCode().run();
  }

  toggleParagraph(): void {
    this.editor?.chain().focus().setParagraph().run();
  }

  toggleHeading(level: Level): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  toggleBlockquote(): void {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  toggleCodeBlock(): void {
    this.editor?.chain().focus().toggleCodeBlock().run();
  }

  insertHorizontalRule(): void {
    this.editor?.chain().focus().setHorizontalRule().run();
  }

  insertHardBreak(): void {
    this.editor?.chain().focus().setHardBreak().run();
  }

  clearFormatting(): void {
    this.editor
      ?.chain()
      .focus()
      .unsetAllMarks()
      .clearNodes()
      .run();
  }

  undo(): void {
    this.editor?.chain().focus().undo().run();
  }

  redo(): void {
    this.editor?.chain().focus().redo().run();
  }

  setTextAlign(alignment: TextAlign): void {
    this.editor?.chain().focus().setTextAlign(alignment).run();
  }

  setTextDirection(direction: TextDirection): void {
    this.editor?.chain().focus().setTextDirection(direction).run();
  }

  setFontFamily(fontFamily: string): void {
    if (fontFamily === '') {
      this.editor?.chain().focus().unsetFontFamily().run();
    } else {
      this.editor?.chain().focus().setFontFamily(fontFamily).run();
    }
  }

  setTextColor(color: string): void {
    this.editor?.chain().focus().setColor(color).run();
  }

  setHighlightColor(color: string): void {
    if (color === 'transparent') {
      this.editor?.chain().focus().unsetHighlight().run();
    } else {
      this.editor?.chain().focus().setHighlight({ color }).run();
    }
  }

  getCurrentFontFamily(): string {
    return this.editor?.getAttributes('textStyle')['fontFamily'] as string || '';
  }

  getCurrentTextColor(): string {
    return this.editor?.getAttributes('textStyle')['color'] as string || '#000000';
  }

  getCurrentHighlightColor(): string {
    const highlightAttrs = this.editor?.getAttributes('highlight');
    return (highlightAttrs?.['color'] as string) || 'transparent';
  }

  setFontSize(size: string): void {
    if (size === '') {
      this.editor?.chain().focus().unsetFontSize().run();
    } else {
      this.editor?.chain().focus().setFontSize(size).run();
    }
  }

  getCurrentFontSize(): string {
    return this.editor?.getAttributes('textStyle')['fontSize'] as string || '16px';
  }

  isDirectionActive(direction: TextDirection): boolean {
    if (!this.editor) {
      return false;
    }

    const paragraphDir = this.editor.getAttributes('paragraph')['textDirection'] as TextDirection | null;
    const headingDir = this.editor.getAttributes('heading')['textDirection'] as TextDirection | null;
    console.log(this.editor.getAttributes('paragraph'));
    console.log(this.editor.getAttributes('heading'));

    return paragraphDir === direction || headingDir === direction;
  }

  isAlignmentActive(alignment: TextAlign): boolean {
    if (!this.editor) {
      return false;
    }

    const paragraphAlign = this.editor.getAttributes('paragraph')['textAlign'] as TextAlign | null;
    const headingAlign = this.editor.getAttributes('heading')['textAlign'] as TextAlign | null;

    // Only show as active if explicitly set to this alignment
    // If no alignment is set (null), none should be active
    return paragraphAlign === alignment || headingAlign === alignment;
  }

  isActive(name: string, attrs?: Record<string, unknown>): boolean {
    return !!this.editor?.isActive(name, attrs);
  }

  private normalizeFontFamily(fontFamily: string): string {
    // Remove backslashes and quotes from font names
    // Example: "\"Courier New\", monospace" -> "Courier New, monospace"
    return fontFamily.replace(/\\"/g, '').replace(/["']/g, '');
  }

  private getCurrentFontFamilyAtCursor(): string {
    if (!this.editor) return '';

    const { view } = this.editor;
    const { from } = this.editor.state.selection;

    // Get the DOM node at cursor position
    const domAtPos = view.domAtPos(from);
    const node = domAtPos.node;

    // Check if node has parentNode and if it's an HTMLElement with style
    if (node.parentNode && (node.parentNode as HTMLElement).style) {
      const parentElement = node.parentNode as HTMLElement;
      const fontFamily = parentElement.style.fontFamily;
      if (fontFamily) {
        return this.normalizeFontFamily(fontFamily);
      }
    }

    // If not found in immediate parent, traverse up the DOM tree
    let currentNode: Node | null = node.parentNode;
    while (currentNode && currentNode !== view.dom) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        if (element.style?.fontFamily) {
          return this.normalizeFontFamily(element.style.fontFamily);
        }
      }
      currentNode = currentNode.parentNode;
    }

    return '';
  }

  private getCurrentFontSizeAtCursor(): string {
    if (!this.editor) return '16px';

    const { view } = this.editor;
    const { from } = this.editor.state.selection;
    const domAtPos = view.domAtPos(from);
    let currentNode: Node | null = domAtPos.node;

    while (currentNode && currentNode !== view.dom) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        if (element.style?.fontSize) {
          return element.style.fontSize;
        }
      }
      currentNode = currentNode.parentNode;
    }

    return '16px';
  }

  private getCurrentTextColorAtCursor(): string {
    if (!this.editor) return '#000000';

    const { view } = this.editor;
    const { from } = this.editor.state.selection;
    const domAtPos = view.domAtPos(from);
    let currentNode: Node | null = domAtPos.node;

    while (currentNode && currentNode !== view.dom) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        if (element.style?.color) {
          return element.style.color;
        }
      }
      currentNode = currentNode.parentNode;
    }

    return '#000000';
  }

  private getCurrentHighlightColorAtCursor(): string {
    if (!this.editor) return 'transparent';

    const { view } = this.editor;
    const { from } = this.editor.state.selection;
    const domAtPos = view.domAtPos(from);
    let currentNode: Node | null = domAtPos.node;

    while (currentNode && currentNode !== view.dom) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        if (element.style?.backgroundColor) {
          const bgColor = element.style.backgroundColor;
          if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
            return bgColor;
          }
        }
      }
      currentNode = currentNode.parentNode;
    }

    return 'transparent';
  }

  updateToolbarState(): void {
    if (!this.editor) return;

    // Get all style attributes using dedicated functions
    this.currentFontFamily = this.getCurrentFontFamilyAtCursor();
    this.currentFontSize = this.getCurrentFontSizeAtCursor();
    this.currentTextColor = this.getCurrentTextColorAtCursor();
    this.currentHighlightColor = this.getCurrentHighlightColorAtCursor();

    this.cdr.markForCheck();
  }

  insertImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          this.editor?.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }

  insertPlaceholderToken(): void {
    const token = window.prompt('Enter placeholder text', 'this-some-text');
    if (!token) {
      return;
    }

    this.editor?.chain().focus().insertPlaceholderToken(token.trim()).run();
  }

  // Table methods
  insertTable(): void {
    this.editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  addColumnBefore(): void {
    this.editor?.chain().focus().addColumnBefore().run();
  }

  addColumnAfter(): void {
    this.editor?.chain().focus().addColumnAfter().run();
  }

  deleteColumn(): void {
    this.editor?.chain().focus().deleteColumn().run();
  }

  addRowBefore(): void {
    this.editor?.chain().focus().addRowBefore().run();
  }

  addRowAfter(): void {
    this.editor?.chain().focus().addRowAfter().run();
  }

  deleteRow(): void {
    this.editor?.chain().focus().deleteRow().run();
  }

  deleteTable(): void {
    this.editor?.chain().focus().deleteTable().run();
  }

  mergeCells(): void {
    this.editor?.chain().focus().mergeCells().run();
  }

  splitCell(): void {
    this.editor?.chain().focus().splitCell().run();
  }

  toggleHeaderColumn(): void {
    this.editor?.chain().focus().toggleHeaderColumn().run();
  }

  toggleHeaderRow(): void {
    this.editor?.chain().focus().toggleHeaderRow().run();
  }

  toggleHeaderCell(): void {
    this.editor?.chain().focus().toggleHeaderCell().run();
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
