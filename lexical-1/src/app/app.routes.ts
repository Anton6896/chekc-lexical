import { Routes } from '@angular/router';
import { LexicalEditorComponent } from './lexical-editor/lexical-editor.component';
import { TiptapEditorComponent } from './tiptap-editor/tiptap-editor.component';

export const routes: Routes = [
  {
    path: 'lexical',
    component: LexicalEditorComponent
  },
  {
    path: 'tiptap',
    component: TiptapEditorComponent
  }
];
