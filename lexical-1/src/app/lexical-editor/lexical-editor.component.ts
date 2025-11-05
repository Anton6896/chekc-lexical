import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  createEditor,
  EditorState,
  LexicalEditor,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  TextFormatType,
  $isTextNode,
  $isElementNode,
  ElementNode
} from 'lexical';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { registerRichText } from '@lexical/rich-text';
import { registerHistory, createEmptyHistoryState } from '@lexical/history';
import { $generateHtmlFromNodes } from '@lexical/html';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { applyTextColor, rgbToHex } from './plugins/color-plugin';
import { applyFontSize } from './plugins/font-size-plugin';
import { applyFontFamily } from './plugins/font-family-plugin';
import { applyTextAlignment, getCurrentTextAlignment, TextAlignment } from './plugins/text-position-plugin';
import { applyTextDirection, getCurrentTextDirection, TextDirection } from './plugins/text-direction-plugin';

@Component({
  selector: 'app-lexical-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lexical-editor.component.html',
  styleUrls: ['./lexical-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LexicalEditorComponent implements AfterViewInit, OnDestroy {
  htmlRepresentation: string = '';
  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;
  isStrikethrough: boolean = false;
  isCode: boolean = false;
  isH1: boolean = false;
  isH2: boolean = false;
  isH3: boolean = false;
  currentFontSize: string = '16px';
  currentFontFamily: string = 'system-ui, -apple-system, sans-serif';
  currentTextColor: string = '#000000';
  currentTextAlignment: TextAlignment = 'left';
  isAlignLeft: boolean = false;
  isAlignCenter: boolean = false;
  isAlignRight: boolean = false;
  currentTextDirection: TextDirection = 'ltr';
  isLtr: boolean = true;
  isRtl: boolean = false;

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
          subscript: 'editor-text-h1', // Using subscript for h1
          superscript: 'editor-text-h2', // Using superscript for h2
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
          this.isCode = selection.hasFormat('code');
          this.isH1 = selection.hasFormat('subscript'); // Using subscript for h1
          this.isH2 = selection.hasFormat('superscript'); // Using superscript for h2
          // For h3, check if both subscript and superscript are applied
          this.isH3 = selection.hasFormat('subscript') && selection.hasFormat('superscript');

          // Get current font size, font family, and color from selected text
          const node = selection.anchor.getNode();
          if ($isTextNode(node)) {
            const style = node.getStyle();
            const fontSizeMatch = style.match(/font-size:\s*([^;]+)/);
            const fontFamilyMatch = style.match(/font-family:\s*([^;]+)/);
            const colorMatch = style.match(/color:\s*([^;]+)/);
            this.currentFontSize = fontSizeMatch ? fontSizeMatch[1] : '16px';
            this.currentFontFamily = fontFamilyMatch ? fontFamilyMatch[1] : 'system-ui, -apple-system, sans-serif';
            this.currentTextColor = colorMatch ? rgbToHex(colorMatch[1].trim()) : '#000000';
          } else {
            this.currentFontSize = '16px';
            this.currentFontFamily = 'system-ui, -apple-system, sans-serif';
            this.currentTextColor = '#000000';
          }

          // Get current text alignment
          this.currentTextAlignment = getCurrentTextAlignment(selection);
          this.isAlignLeft = this.currentTextAlignment === 'left';
          this.isAlignCenter = this.currentTextAlignment === 'center';
          this.isAlignRight = this.currentTextAlignment === 'right';

          // Get current text direction
          this.currentTextDirection = getCurrentTextDirection(selection);
          this.isLtr = this.currentTextDirection === 'ltr';
          this.isRtl = this.currentTextDirection === 'rtl';
        } else {
          this.isBold = false;
          this.isItalic = false;
          this.isUnderline = false;
          this.isStrikethrough = false;
          this.isCode = false;
          this.isH1 = false;
          this.isH2 = false;
          this.isH3 = false;
          this.currentFontSize = '16px';
          this.currentFontFamily = 'system-ui, -apple-system, sans-serif';
          this.currentTextColor = '#000000';
          this.currentTextAlignment = 'left';
          this.isAlignLeft = false;
          this.isAlignCenter = false;
          this.isAlignRight = false;
          this.currentTextDirection = 'ltr';
          this.isLtr = true;
          this.isRtl = false;
        }
      });
      this.log(editorState);
    });

    // Set initial content
    this.editor.update(() => {
      const root = $getRoot();
      if (root.getFirstChild() === null) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode('some default text loaded'));
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
      this.editor.focus();
      // Map heading tags to Lexical text formats
      // Using subscript for h1, superscript for h2, both for h3
      if (headingTag === 'h1') {
        this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
      } else if (headingTag === 'h2') {
        this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
      } else if (headingTag === 'h3') {
        // For h3, apply both subscript and superscript
        this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
        this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
      }
    }
  }

  setFontSize(size: string): void {
    if (this.editor) {
      applyFontSize(this.editor, size);
    }
  }

  onFontSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.setFontSize(target.value);
  }

  setFontFamily(fontFamily: string): void {
    if (this.editor) {
      applyFontFamily(this.editor, fontFamily);
    }
  }

  onFontFamilyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.setFontFamily(target.value);
  }

  setTextColor(color: string): void {
    if (this.editor) {
      applyTextColor(this.editor, color);
    }
  }

  onTextColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setTextColor(target.value);
  }

  setTextAlignment(alignment: TextAlignment): void {
    if (this.editor) {
      applyTextAlignment(this.editor, alignment);
    }
  }

  setTextDirection(direction: TextDirection): void {
    if (this.editor) {
      applyTextDirection(this.editor, direction);
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
    if (!this.editor) return;

    this.editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        // Clear text formatting (bold, italic, underline, etc.)
        if (this.isBold) this.editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        if (this.isItalic) this.editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        if (this.isUnderline) this.editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        if (this.isStrikethrough) this.editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        if (this.isCode) this.editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');

        // Clear heading formats (h1, h2, h3)
        if (this.isH1) this.editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
        if (this.isH2) this.editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
        if (this.isH3) {
          this.editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
          this.editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
        }

        // Get all nodes in selection
        let nodes = selection.getNodes();
        if (nodes.length === 0) {
          const anchorNode = selection.anchor.getNode();
          if (anchorNode) {
            nodes = [anchorNode];
          }
        }

        // Process each node to clear styles and block-level formatting
        const processedParents = new Set<string>();

        nodes.forEach((node) => {
          // Clear inline styles (font size, font family, color) from text nodes
          if ($isTextNode(node)) {
            node.setStyle('');
          }

          // Get parent element for block-level clearing
          let parent = $isElementNode(node) ? node : node.getParent();

          // Find the top-level block element
          while (parent !== null && parent.getParent() !== null && parent.getParent()?.getType() !== 'root') {
            parent = parent.getParent();
          }

          if (parent && $isElementNode(parent)) {
            const parentKey = parent.getKey();

            if (!processedParents.has(parentKey)) {
              processedParents.add(parentKey);

              // Cast to ElementNode to access element-specific methods
              const elementParent = parent as ElementNode;

              // Reset text alignment to left
              elementParent.setFormat('left');

              // Reset text direction to ltr
              elementParent.setDirection('ltr');

              // Clear any inline styles on the element
              elementParent.setStyle('');
            }
          }
        });
      }
    });

    this.editor.focus();
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
