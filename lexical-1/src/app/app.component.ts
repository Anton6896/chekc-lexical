import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LexicalEditorComponent } from './lexical-editor/lexical-editor.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LexicalEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'lexical-1';
}
