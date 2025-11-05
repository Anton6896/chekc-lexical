import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import type { Level } from '@tiptap/extension-heading';
import {
  TiptapBubbleMenuDirective,
  TiptapEditorDirective,
  TiptapFloatingMenuDirective,
} from 'ngx-tiptap';

@Component({
  selector: 'app-tiptap-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TiptapEditorDirective,
    TiptapBubbleMenuDirective,
    TiptapFloatingMenuDirective,
  ],
  templateUrl: './tiptap-editor.component.html',
  styleUrls: ['./tiptap-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiptapEditorComponent implements OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly editor: Editor;
  content = '<p>Hello, Tiptap!</p>';
  htmlOutput = this.content;

  constructor() {
    this.editor = new Editor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4, 5, 6] },
        }),
      ],
      content: this.content,
      onUpdate: ({ editor }) => {
        this.htmlOutput = editor.getHTML();
        this.cdr.markForCheck();
      },
      onSelectionUpdate: () => this.cdr.markForCheck(),
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  toggleBold(): void {
    this.editor.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor.chain().focus().toggleItalic().run();
  }

  toggleStrike(): void {
    this.editor.chain().focus().toggleStrike().run();
  }

  toggleCode(): void {
    this.editor.chain().focus().toggleCode().run();
  }

  toggleCodeBlock(): void {
    this.editor.chain().focus().toggleCodeBlock().run();
  }

  toggleBlockquote(): void {
    this.editor.chain().focus().toggleBlockquote().run();
  }

  toggleBulletList(): void {
    this.editor.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor.chain().focus().toggleOrderedList().run();
  }

  setParagraph(): void {
    this.editor.chain().focus().setParagraph().run();
  }

  toggleHeading(level: Level): void {
    this.editor.chain().focus().toggleHeading({ level }).run();
  }

  insertHorizontalRule(): void {
    this.editor.chain().focus().setHorizontalRule().run();
  }

  insertHardBreak(): void {
    this.editor.chain().focus().setHardBreak().run();
  }

  undo(): void {
    this.editor.chain().focus().undo().run();
  }

  redo(): void {
    this.editor.chain().focus().redo().run();
  }

  clearFormatting(): void {
    this.editor.chain().focus().unsetAllMarks().clearNodes().run();
  }

  isActive(name: string, attrs?: Record<string, unknown>): boolean {
    return this.editor.isActive(name, attrs ?? {});
  }
}
