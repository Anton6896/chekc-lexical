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
  content = `<h3 style="text-align: center;">Lorem ipsum dolor sit amet,</h3><p><strong>consectetur adipiscing elit. Aliquam odio nibh, accumsan eget semper</strong> ac, tempor pulvinar risus. Proin nibh dolor, commodo sit amet tincidunt at, pretium ac erat. Donec congue lorem sem, tincidunt maximus lorem iaculis pharetra. Curabitur eget dictum ligula. Maecenas a rutrum dui, sit amet suscipit dui. <span style="font-size: 20px;">Nam ut velit rhoncus ligula</span></p><ul><li><p><span style="color: rgb(223, 42, 42);">fringilla sagittis vitae sit amet lorem.</span></p><ul><li><p><mark data-color="#f2f25a" style="background-color: rgb(242, 242, 90); color: inherit;">Suspendisse efficitur placerat est eu porta.</mark></p><ul><li><p><span style="font-family: &quot;Courier New&quot;, monospace;">Nulla non mauris sit amet justo <em>tristique aliquam</em>. Integer sed orci eu ipsum <strong>sagittis elementum </strong>ut id enim. Donec posuere enim a interdum gravida. Quisque eu turpis vitae dui blandit facilisis. Nullam s<s>ollicitudin fermentum commodo</s>.</span><br></p></li></ul></li></ul></li></ul><p><span style="font-family: Georgia, serif;">Maecenas feugiat et ipsum et tempor. Nulla dictum euismod ligula, vel cursus dolor sollicitudin eget. Morbi risus urna, congue et lorem vitae,</span></p><ol><li><p><span style="font-family: Verdana, sans-serif;">vehicula tristique mauris.</span></p><ol><li><p><span style="font-family: Verdana, sans-serif;">Nullam felis massa, gravida a tempor vitae, faucibus ac est. Curabitur congue, felis a</span></p></li></ol></li></ol><p style="text-align: right; direction: rtl;">לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית גולר מונפרר סוברט לורם שבצק יהול, לכנוץ בעריר גק ליץ, וש  בעגט ליבם סולגק. בראיט ולחת צורק מונחף, בגורמי מגמש. תרבנך וסתעד לכנו סתשם השמה - לתכי מורגם בורק? לתיג ישבעס.</p><p><img src="data:image/png;base64,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"> What is this image ? sdsd <span data-placeholder-token="" class="placeholder-token" contenteditable="false" data-placeholder-label="this-some-text">{{ this-some-text }}</span> sdsd</p>`

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
