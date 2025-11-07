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
  $isTextNode
} from 'lexical';
import { $getRoot } from 'lexical';
import { registerRichText } from '@lexical/rich-text';
import { registerHistory, createEmptyHistoryState } from '@lexical/history';
import { registerList } from '@lexical/list';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { applyTextColor, rgbToHex } from './plugins/color-plugin';
import { applyFontSize } from './plugins/font-size-plugin';
import { applyFontFamily } from './plugins/font-family-plugin';
import { applyTextAlignment, getCurrentTextAlignment, TextAlignment } from './plugins/text-position-plugin';
import { applyTextDirection, getCurrentTextDirection, TextDirection } from './plugins/text-direction-plugin';
import { clearAllFormatting } from './plugins/clear-formatting-plugin';
import { toggleBulletList, toggleNumberedList, getCurrentListType, ListType } from './plugins/list-plugin';

const sampleText = `<h3 style="text-align: center;">Lorem ipsum dolor sit amet,</h3><p> consectetur adipiscing elit. Aliquam odio nibh, accumsan eget semper ac, tempor pulvinar risus. Proin nibh dolor, commodo sit amet tincidunt at, pretium ac erat. Donec congue lorem sem, tincidunt maximus lorem iaculis pharetra. Curabitur eget dictum ligula. Maecenas a rutrum dui, sit amet suscipit dui. Nam ut velit rhoncus ligula </p><ul><li><p><span style="color: rgb(223, 42, 42);">fringilla sagittis vitae sit amet lorem. </span></p></li><li><p><mark data-color="#f2f25a" style="background-color: rgb(242, 242, 90); color: inherit;">Suspendisse efficitur placerat est eu porta. </mark></p></li><li><p><span style="font-family: &quot;Times New Roman&quot;, serif;">Nulla non mauris sit amet justo tristique aliquam. Integer sed orci eu ipsum sagittis elementum ut id enim. Donec posuere enim a interdum gravida. Quisque eu turpis vitae dui blandit facilisis. Nullam sollicitudin fermentum commodo.</span><br></p></li></ul><p><span style="font-family: Georgia, serif;">Maecenas feugiat et ipsum et tempor. Nulla dictum euismod ligula, vel cursus dolor sollicitudin eget. Morbi risus urna, congue et lorem vitae, vehicula tristique mauris. Nullam felis massa, gravida a tempor vitae, faucibus ac est. Curabitur congue, felis a placerat blandit, eros orci ornare sapien, ac luctus mauris sapien vel quam. Donec non faucibus magna. Vivamus a nisi ullamcorper, scelerisque turpis vitae, ultrices libero. Aliquam posuere nisl nec lacinia vestibulum. Sed sit amet purus in nunc sollicitudin condimentum. Aliquam id purus volutpat, porta mi sit amet, dignissim orci. Duis ut nunc nisl. Morbi nec libero gravida, venenatis augue eu, semper enim.</span></p>`;

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
  currentListType: ListType = null;
  isBulletList: boolean = false;
  isNumberedList: boolean = false;

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
    registerList(this.editor);

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

          // Get current list type
          this.currentListType = getCurrentListType(selection);
          this.isBulletList = this.currentListType === 'bullet';
          this.isNumberedList = this.currentListType === 'number';
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
          this.currentListType = null;
          this.isBulletList = false;
          this.isNumberedList = false;
        }
      });
      this.log(editorState);
    });

    // Set initial content from sampleText HTML
    this.editor.update(() => {
      const root = $getRoot();
      if (root.getFirstChild() === null) {
        // Parse the HTML string into DOM nodes
        const parser = new DOMParser();
        const dom = parser.parseFromString(sampleText, 'text/html');

        // Generate Lexical nodes from the DOM
        const nodes = $generateNodesFromDOM(this.editor!, dom);

        // Append the nodes to the root
        root.append(...nodes);
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

  toggleBulletListFormatting(): void {
    if (this.editor) {
      toggleBulletList(this.editor);
    }
  }

  toggleNumberedListFormatting(): void {
    if (this.editor) {
      toggleNumberedList(this.editor);
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

    clearAllFormatting(this.editor, {
      isBold: this.isBold,
      isItalic: this.isItalic,
      isUnderline: this.isUnderline,
      isStrikethrough: this.isStrikethrough,
      isCode: this.isCode,
      isH1: this.isH1,
      isH2: this.isH2,
      isH3: this.isH3
    });
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
