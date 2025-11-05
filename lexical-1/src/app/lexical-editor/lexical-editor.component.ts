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
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { registerRichText } from '@lexical/rich-text';
import { registerHistory, createEmptyHistoryState } from '@lexical/history';
import { $generateHtmlFromNodes } from '@lexical/html';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';

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
            this.currentTextColor = colorMatch ? this.rgbToHex(colorMatch[1].trim()) : '#000000';
          } else {
            this.currentFontSize = '16px';
            this.currentFontFamily = 'system-ui, -apple-system, sans-serif';
            this.currentTextColor = '#000000';
          }
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
      this.editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Check if selection is collapsed (no text selected)
          if (selection.isCollapsed()) {
            return;
          }

          // Get the selected text nodes
          const nodes = selection.getNodes();
          const anchorOffset = selection.anchor.offset;
          const focusOffset = selection.focus.offset;

          nodes.forEach((node, index) => {
            if ($isTextNode(node)) {
              const isFirst = index === 0;
              const isLast = index === nodes.length - 1;

              // If this is a partial selection within a text node
              if (isFirst || isLast) {
                const textContent = node.getTextContent();

                // Determine the actual selection boundaries for this node
                let startOffset = 0;
                let endOffset = textContent.length;

                if (isFirst && node.getKey() === selection.anchor.getNode().getKey()) {
                  startOffset = anchorOffset;
                }
                if (isLast && node.getKey() === selection.focus.getNode().getKey()) {
                  endOffset = focusOffset;
                }

                // Normalize offsets if selection is backwards
                const actualStart = Math.min(startOffset, endOffset);
                const actualEnd = Math.max(startOffset, endOffset);

                // If we're selecting only part of this node, we need to split it
                if (actualStart > 0 || actualEnd < textContent.length) {
                  // Split the text node into parts
                  const beforeText = textContent.substring(0, actualStart);
                  const selectedText = textContent.substring(actualStart, actualEnd);
                  const afterText = textContent.substring(actualEnd);

                  if (selectedText) {
                    // Create a new text node for the selected portion
                    const selectedNode = $createTextNode(selectedText);

                    // Copy formats from original node
                    if (node.hasFormat('bold')) selectedNode.toggleFormat('bold');
                    if (node.hasFormat('italic')) selectedNode.toggleFormat('italic');
                    if (node.hasFormat('underline')) selectedNode.toggleFormat('underline');
                    if (node.hasFormat('strikethrough')) selectedNode.toggleFormat('strikethrough');
                    if (node.hasFormat('code')) selectedNode.toggleFormat('code');

                    // Apply the new font size
                    let style = node.getStyle();
                    style = style.replace(/font-size:\s*[^;]+;?\s*/g, '');
                    style = style ? `${style}; font-size: ${size}` : `font-size: ${size}`;
                    selectedNode.setStyle(style.trim());

                    // Replace or insert nodes
                    if (beforeText && afterText) {
                      // Split into 3 parts: before, selected, after
                      const afterNode = $createTextNode(afterText);
                      if (node.hasFormat('bold')) afterNode.toggleFormat('bold');
                      if (node.hasFormat('italic')) afterNode.toggleFormat('italic');
                      if (node.hasFormat('underline')) afterNode.toggleFormat('underline');
                      if (node.hasFormat('strikethrough')) afterNode.toggleFormat('strikethrough');
                      if (node.hasFormat('code')) afterNode.toggleFormat('code');
                      const originalStyle = node.getStyle();
                      if (originalStyle) afterNode.setStyle(originalStyle);

                      node.setTextContent(beforeText);
                      node.insertAfter(selectedNode);
                      selectedNode.insertAfter(afterNode);
                    } else if (beforeText) {
                      // Only before and selected
                      node.setTextContent(beforeText);
                      node.insertAfter(selectedNode);
                    } else if (afterText) {
                      // Only selected and after
                      const afterNode = $createTextNode(afterText);
                      if (node.hasFormat('bold')) afterNode.toggleFormat('bold');
                      if (node.hasFormat('italic')) afterNode.toggleFormat('italic');
                      if (node.hasFormat('underline')) afterNode.toggleFormat('underline');
                      if (node.hasFormat('strikethrough')) afterNode.toggleFormat('strikethrough');
                      if (node.hasFormat('code')) afterNode.toggleFormat('code');
                      const originalStyle = node.getStyle();
                      if (originalStyle) afterNode.setStyle(originalStyle);

                      node.replace(selectedNode);
                      selectedNode.insertAfter(afterNode);
                    } else {
                      // Entire node is selected
                      node.replace(selectedNode);
                    }
                  }
                  return;
                }
              }

              // If entire node is selected, just update its style
              let style = node.getStyle();
              style = style.replace(/font-size:\s*[^;]+;?\s*/g, '');
              style = style ? `${style}; font-size: ${size}` : `font-size: ${size}`;
              node.setStyle(style.trim());
            }
          });
        }
      });
      this.editor.focus();
    }
  }

  onFontSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.setFontSize(target.value);
  }

  setFontFamily(fontFamily: string): void {
    if (this.editor) {
      this.editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Check if selection is collapsed (no text selected)
          if (selection.isCollapsed()) {
            return;
          }

          // Get the selected text nodes
          const nodes = selection.getNodes();
          const anchorOffset = selection.anchor.offset;
          const focusOffset = selection.focus.offset;

          nodes.forEach((node, index) => {
            if ($isTextNode(node)) {
              const isFirst = index === 0;
              const isLast = index === nodes.length - 1;

              // If this is a partial selection within a text node
              if (isFirst || isLast) {
                const textContent = node.getTextContent();

                // Determine the actual selection boundaries for this node
                let startOffset = 0;
                let endOffset = textContent.length;

                if (isFirst && node.getKey() === selection.anchor.getNode().getKey()) {
                  startOffset = anchorOffset;
                }
                if (isLast && node.getKey() === selection.focus.getNode().getKey()) {
                  endOffset = focusOffset;
                }

                // Normalize offsets if selection is backwards
                const actualStart = Math.min(startOffset, endOffset);
                const actualEnd = Math.max(startOffset, endOffset);

                // If we're selecting only part of this node, we need to split it
                if (actualStart > 0 || actualEnd < textContent.length) {
                  // Split the text node into parts
                  const beforeText = textContent.substring(0, actualStart);
                  const selectedText = textContent.substring(actualStart, actualEnd);
                  const afterText = textContent.substring(actualEnd);

                  if (selectedText) {
                    // Create a new text node for the selected portion
                    const selectedNode = $createTextNode(selectedText);

                    // Copy formats from original node
                    if (node.hasFormat('bold')) selectedNode.toggleFormat('bold');
                    if (node.hasFormat('italic')) selectedNode.toggleFormat('italic');
                    if (node.hasFormat('underline')) selectedNode.toggleFormat('underline');
                    if (node.hasFormat('strikethrough')) selectedNode.toggleFormat('strikethrough');
                    if (node.hasFormat('code')) selectedNode.toggleFormat('code');

                    // Apply the new font family
                    let style = node.getStyle();
                    style = style.replace(/font-family:\s*[^;]+;?\s*/g, '');
                    style = style ? `${style}; font-family: ${fontFamily}` : `font-family: ${fontFamily}`;
                    selectedNode.setStyle(style.trim());

                    // Replace or insert nodes
                    if (beforeText && afterText) {
                      // Split into 3 parts: before, selected, after
                      const afterNode = $createTextNode(afterText);
                      if (node.hasFormat('bold')) afterNode.toggleFormat('bold');
                      if (node.hasFormat('italic')) afterNode.toggleFormat('italic');
                      if (node.hasFormat('underline')) afterNode.toggleFormat('underline');
                      if (node.hasFormat('strikethrough')) afterNode.toggleFormat('strikethrough');
                      if (node.hasFormat('code')) afterNode.toggleFormat('code');
                      const originalStyle = node.getStyle();
                      if (originalStyle) afterNode.setStyle(originalStyle);

                      node.setTextContent(beforeText);
                      node.insertAfter(selectedNode);
                      selectedNode.insertAfter(afterNode);
                    } else if (beforeText) {
                      // Only before and selected
                      node.setTextContent(beforeText);
                      node.insertAfter(selectedNode);
                    } else if (afterText) {
                      // Only selected and after
                      const afterNode = $createTextNode(afterText);
                      if (node.hasFormat('bold')) afterNode.toggleFormat('bold');
                      if (node.hasFormat('italic')) afterNode.toggleFormat('italic');
                      if (node.hasFormat('underline')) afterNode.toggleFormat('underline');
                      if (node.hasFormat('strikethrough')) afterNode.toggleFormat('strikethrough');
                      if (node.hasFormat('code')) afterNode.toggleFormat('code');
                      const originalStyle = node.getStyle();
                      if (originalStyle) afterNode.setStyle(originalStyle);

                      node.replace(selectedNode);
                      selectedNode.insertAfter(afterNode);
                    } else {
                      // Entire node is selected
                      node.replace(selectedNode);
                    }
                  }
                  return;
                }
              }

              // If entire node is selected, just update its style
              let style = node.getStyle();
              style = style.replace(/font-family:\s*[^;]+;?\s*/g, '');
              style = style ? `${style}; font-family: ${fontFamily}` : `font-family: ${fontFamily}`;
              node.setStyle(style.trim());
            }
          });
        }
      });
      this.editor.focus();
    }
  }

  onFontFamilyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.setFontFamily(target.value);
  }

  setTextColor(color: string): void {
    if (this.editor) {
      this.editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Check if selection is collapsed (no text selected)
          if (selection.isCollapsed()) {
            return;
          }

          // Get the selected text nodes
          const nodes = selection.getNodes();
          const anchorOffset = selection.anchor.offset;
          const focusOffset = selection.focus.offset;

          nodes.forEach((node, index) => {
            if ($isTextNode(node)) {
              const isFirst = index === 0;
              const isLast = index === nodes.length - 1;

              // If this is a partial selection within a text node
              if (isFirst || isLast) {
                const textContent = node.getTextContent();

                // Determine the actual selection boundaries for this node
                let startOffset = 0;
                let endOffset = textContent.length;

                if (isFirst && node.getKey() === selection.anchor.getNode().getKey()) {
                  startOffset = anchorOffset;
                }
                if (isLast && node.getKey() === selection.focus.getNode().getKey()) {
                  endOffset = focusOffset;
                }

                // Normalize offsets if selection is backwards
                const actualStart = Math.min(startOffset, endOffset);
                const actualEnd = Math.max(startOffset, endOffset);

                // If we're selecting only part of this node, we need to split it
                if (actualStart > 0 || actualEnd < textContent.length) {
                  // Split the text node into parts
                  const beforeText = textContent.substring(0, actualStart);
                  const selectedText = textContent.substring(actualStart, actualEnd);
                  const afterText = textContent.substring(actualEnd);

                  if (selectedText) {
                    // Create a new text node for the selected portion
                    const selectedNode = $createTextNode(selectedText);

                    // Copy formats from original node
                    if (node.hasFormat('bold')) selectedNode.toggleFormat('bold');
                    if (node.hasFormat('italic')) selectedNode.toggleFormat('italic');
                    if (node.hasFormat('underline')) selectedNode.toggleFormat('underline');
                    if (node.hasFormat('strikethrough')) selectedNode.toggleFormat('strikethrough');
                    if (node.hasFormat('code')) selectedNode.toggleFormat('code');

                    // Apply the new text color
                    let style = node.getStyle();
                    style = style.replace(/color:\s*[^;]+;?\s*/g, '');
                    style = style ? `${style}; color: ${color}` : `color: ${color}`;
                    selectedNode.setStyle(style.trim());

                    // Replace or insert nodes
                    if (beforeText && afterText) {
                      // Split into 3 parts: before, selected, after
                      const afterNode = $createTextNode(afterText);
                      if (node.hasFormat('bold')) afterNode.toggleFormat('bold');
                      if (node.hasFormat('italic')) afterNode.toggleFormat('italic');
                      if (node.hasFormat('underline')) afterNode.toggleFormat('underline');
                      if (node.hasFormat('strikethrough')) afterNode.toggleFormat('strikethrough');
                      if (node.hasFormat('code')) afterNode.toggleFormat('code');
                      const originalStyle = node.getStyle();
                      if (originalStyle) afterNode.setStyle(originalStyle);

                      node.setTextContent(beforeText);
                      node.insertAfter(selectedNode);
                      selectedNode.insertAfter(afterNode);
                    } else if (beforeText) {
                      // Only before and selected
                      node.setTextContent(beforeText);
                      node.insertAfter(selectedNode);
                    } else if (afterText) {
                      // Only selected and after
                      const afterNode = $createTextNode(afterText);
                      if (node.hasFormat('bold')) afterNode.toggleFormat('bold');
                      if (node.hasFormat('italic')) afterNode.toggleFormat('italic');
                      if (node.hasFormat('underline')) afterNode.toggleFormat('underline');
                      if (node.hasFormat('strikethrough')) afterNode.toggleFormat('strikethrough');
                      if (node.hasFormat('code')) afterNode.toggleFormat('code');
                      const originalStyle = node.getStyle();
                      if (originalStyle) afterNode.setStyle(originalStyle);

                      node.replace(selectedNode);
                      selectedNode.insertAfter(afterNode);
                    } else {
                      // Entire node is selected
                      node.replace(selectedNode);
                    }
                  }
                  return;
                }
              }

              // If entire node is selected, just update its style
              let style = node.getStyle();
              style = style.replace(/color:\s*[^;]+;?\s*/g, '');
              style = style ? `${style}; color: ${color}` : `color: ${color}`;
              node.setStyle(style.trim());
            }
          });
        }
      });
      this.editor.focus();
    }
  }

  onTextColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setTextColor(target.value);
  }

  // Helper function to convert RGB to Hex
  private rgbToHex(rgb: string): string {
    // If it's already a hex color, return it
    if (rgb.startsWith('#')) {
      return rgb;
    }

    // Parse rgb(r, g, b) format
    const rgbMatch = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }

    // Default to black if we can't parse
    return '#000000';
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
      if (this.isCode) this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
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
