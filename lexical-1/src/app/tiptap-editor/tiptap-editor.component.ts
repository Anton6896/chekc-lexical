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
import FontSize from './extentions/font-size/font-size-extension';
import { TiptapEditorDirective } from 'ngx-tiptap';
import type { Level } from '@tiptap/extension-heading';
import TextAlignExtension, { type TextAlign, } from './extentions/tiptap-text-aligin-extension';
import TextDirectionExtension, { type TextDirection } from './extentions/text-direction/text-direction-extention';


const sampleText = `<h3 style="text-align: center;">Lorem ipsum dolor sit amet,</h3><p> consectetur adipiscing elit. Aliquam odio nibh, accumsan eget semper ac, tempor pulvinar risus. Proin nibh dolor, commodo sit amet tincidunt at, pretium ac erat. Donec congue lorem sem, tincidunt maximus lorem iaculis pharetra. Curabitur eget dictum ligula. Maecenas a rutrum dui, sit amet suscipit dui. Nam ut velit rhoncus ligula </p><ul><li><p><span style="color: rgb(223, 42, 42);">fringilla sagittis vitae sit amet lorem. </span></p></li><li><p><mark data-color="#f2f25a" style="background-color: rgb(242, 242, 90); color: inherit;">Suspendisse efficitur placerat est eu porta. </mark></p></li><li><p><span style="font-family: &quot;Times New Roman&quot;, serif;">Nulla non mauris sit amet justo tristique aliquam. Integer sed orci eu ipsum sagittis elementum ut id enim. Donec posuere enim a interdum gravida. Quisque eu turpis vitae dui blandit facilisis. Nullam sollicitudin fermentum commodo.</span><br></p></li></ul><p><span style="font-family: Georgia, serif;">Maecenas feugiat et ipsum et tempor. Nulla dictum euismod ligula, vel cursus dolor sollicitudin eget. Morbi risus urna, congue et lorem vitae, vehicula tristique mauris. Nullam felis massa, gravida a tempor vitae, faucibus ac est. Curabitur congue, felis a placerat blandit, eros orci ornare sapien, ac luctus mauris sapien vel quam. Donec non faucibus magna. Vivamus a nisi ullamcorper, scelerisque turpis vitae, ultrices libero. Aliquam posuere nisl nec lacinia vestibulum. Sed sit amet purus in nunc sollicitudin condimentum. Aliquam id purus volutpat, porta mi sit amet, dignissim orci. Duis ut nunc nisl. Morbi nec libero gravida, venenatis augue eu, semper enim.</span></p>`;

@Component({
  selector: 'app-tiptap-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TiptapEditorDirective,
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
        TextAlignExtension,
        TextDirectionExtension,
      ],
      content: this.content,
      onUpdate: ({ editor }) => {
        this.htmlOutput = editor.getHTML();
        this.content = this.htmlOutput;
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

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
