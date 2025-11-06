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

  // Use default configurations as base
  toolbarConfig = {
    ...DEFAULT_TOOLBAR_CONFIG,
    clear: true, // Add clear button
  };

  bubbleMenuConfig = {
    ...DEFAULT_BUBBLE_MENU_CONFIG,
    table: true, // Enable table bubble menu
  };

  slashCommandsConfig = {
    commands: [], // Will be populated by the library
  };

  onContentChange(newContent: string) {
    this.content = newContent;
  }

}
