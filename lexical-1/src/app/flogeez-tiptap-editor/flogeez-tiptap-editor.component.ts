import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from "@angular/forms";

import {
  AngularTiptapEditorComponent,
  DEFAULT_TOOLBAR_CONFIG,
  DEFAULT_BUBBLE_MENU_CONFIG,
} from "@flogeez/angular-tiptap-editor";

@Component({
  selector: 'app-flogeez-tiptap-editor',
  imports: [
    AngularTiptapEditorComponent, ReactiveFormsModule
  ],
  templateUrl: './flogeez-tiptap-editor.component.html',
  styleUrl: './flogeez-tiptap-editor.component.scss'
})
export class FlogeezTiptapEditorComponent {
  content = "<h1>Welcome!</h1><p>Start editing...</p>";

  // Use default configurations as base with all available options
  toolbarConfig = {
    ...DEFAULT_TOOLBAR_CONFIG,
    // Text formatting
    bold: true,
    italic: true,
    underline: true,
    strike: true,
    code: true,
    superscript: true,
    subscript: true,

    // Headings
    heading1: true,
    heading2: true,
    heading3: true,

    // Lists
    bulletList: true,
    orderedList: true,
    blockquote: true,

    // Text alignment (text position)
    alignLeft: true,
    alignCenter: true,
    alignRight: true,
    alignJustify: true,

    // Media & content
    link: true,
    image: true,
    horizontalRule: true,
    table: true,

    // Highlighting
    highlight: true,

    // Actions
    undo: true,
    redo: true,
    clear: true,

    // Visual separator
    separator: true,
  };

  // Bubble menu configuration (appears on text selection)
  bubbleMenuConfig = {
    ...DEFAULT_BUBBLE_MENU_CONFIG,
    bold: true,
    italic: true,
    underline: true,
    strike: true,
    code: true,
    superscript: true,
    subscript: true,
    highlight: true,
    link: true,
    separator: true,
  };

  slashCommandsConfig = {
    commands: [], // Will be populated by the library
  };

  onContentChange(newContent: string) {
    this.content = newContent;
  }

}
