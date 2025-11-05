import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createEditor, EditorState, LexicalEditor } from 'lexical';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { registerPlainText } from '@lexical/plain-text';
import { registerHistory, createEmptyHistoryState } from '@lexical/history';
import { $generateHtmlFromNodes } from '@lexical/html';

@Component({
  selector: 'app-lexical-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lexical-editor.component.html',
  styleUrl: './lexical-editor.component.scss'
})
export class LexicalEditorComponent implements AfterViewInit, OnDestroy {

  htmlRepresentation: string = ''

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
      }
    };

    this.editor = createEditor(editorConfig);
    this.editor.setRootElement(this.editorContainer.nativeElement);

    // Register plugins
    registerPlainText(this.editor);
    registerHistory(this.editor, createEmptyHistoryState(), 300);

    // Listen to changes
    this.editor.registerUpdateListener(({ editorState }) => {
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
