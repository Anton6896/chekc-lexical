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
import { TiptapEditorDirective } from 'ngx-tiptap';
import type { Level } from '@tiptap/extension-heading';
import TextAlignExtension, { type TextAlign, } from './extentions/tiptap-text-aligin-extension';
import TextDirectionExtension, { type TextDirection } from './extentions/text-direction/text-direction-extention';

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

  content = '<p>Hello, Tiptap!</p>';
  htmlOutput = this.content;
  readonly alignments: TextAlign[] = ['left', 'center', 'right', 'justify'];
  readonly defaultAlignment: TextAlign = 'left';

  readonly textDirection: TextDirection[] = ['rtl', 'ltr'];
  readonly defaultTextDirection: TextDirection = 'rtl';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.editor = new Editor({
      extensions: [
        StarterKit.configure({
          bulletList: { keepMarks: true },
          orderedList: { keepMarks: true },
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

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
