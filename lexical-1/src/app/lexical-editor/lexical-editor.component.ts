import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  createEditor,
  EditorState,
  LexicalEditor,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection
} from 'lexical';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { registerRichText } from '@lexical/rich-text';
import { registerHistory, createEmptyHistoryState } from '@lexical/history';
import { $generateHtmlFromNodes } from '@lexical/html';
import { HeadingNode, QuoteNode, $createHeadingNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';

@Component({
  selector: 'app-lexical-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lexical-editor.component.html',
  styleUrl: './lexical-editor.component.scss'
})
export class LexicalEditorComponent implements AfterViewInit, OnDestroy {
  htmlRepresentation: string = '';
  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;
  isStrikethrough: boolean = false;

  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;

  private editor: LexicalEditor | null = null;

  ngAfterViewInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.setEditable(false);
    }
  }

  private initializeEditor(): void {
    const editorConfig = {
      namespace: 'MyEditor',
      onError: (error: Error) => {
        console.error(error);
        throw error;
      },
      theme: {
        ltr: 'ltr',
        rtl: 'rtl',
        placeholder: 'editor-placeholder',
        paragraph: 'editor-paragraph',
        text: {
          bold: 'editor-text-bold',
          italic: 'editor-text-italic',
          underline: 'editor-text-underline',
          strikethrough: 'editor-text-strikethrough',
          code: 'editor-text-code',
        },
        heading: {
          h1: 'editor-heading-h1',
          h2: 'editor-heading-h2',
          h3: 'editor-heading-h3',
        },
        quote: 'editor-quote',
        code: 'editor-code',
      },
      nodes: [
        HeadingNode,
        QuoteNode,
        LinkNode,
        AutoLinkNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
      ]
    };

    this.editor = createEditor(editorConfig);
    this.editor.setRootElement(this.editorContainer.nativeElement);

    // Register plugins
    registerRichText(this.editor);
    registerHistory(this.editor, createEmptyHistoryState(), 300);

    // Listen to changes and update formatting state
    this.editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          this.isBold = selection.hasFormat('bold');
          this.isItalic = selection.hasFormat('italic');
          this.isUnderline = selection.hasFormat('underline');
          this.isStrikethrough = selection.hasFormat('strikethrough');
        }
      });
      this.log(editorState);
    });

    // Set initial content
    this.editor.update(() => {
      const root = $getRoot();
      if (root.getFirstChild() === null) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(''));
        root.append(paragraph);
      }
    });
  }

  // Toolbar actions
  formatText(format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'): void {
    if (this.editor) {
      this.editor.focus();
      this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    }
  }

  formatHeading(headingTag: 'h1' | 'h2' | 'h3'): void {
    if (this.editor) {
      this.editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const heading = $createHeadingNode(headingTag);
          selection.insertNodes([heading]);
        }
      });
    }
  }

  undo(): void {
    if (this.editor) {
      this.editor.dispatchCommand(UNDO_COMMAND, undefined);
    }
  }

  redo(): void {
    if (this.editor) {
      this.editor.dispatchCommand(REDO_COMMAND, undefined);
    }
  }

  clearFormatting(): void {
    if (this.editor) {
      if (this.isBold) this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
      if (this.isItalic) this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
      if (this.isUnderline) this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
      if (this.isStrikethrough) this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
    }
  }

  private log(editorState: EditorState): void {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();

      // Get HTML representation
      this.htmlRepresentation = $generateHtmlFromNodes(this.editor!);

      console.log('Editor content:', textContent);
      console.log('HTML output:', this.htmlRepresentation);
    });
  }
}
