import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlogeezTiptapEditorComponent } from './flogeez-tiptap-editor.component';

describe('FlogeezTiptapEditorComponent', () => {
  let component: FlogeezTiptapEditorComponent;
  let fixture: ComponentFixture<FlogeezTiptapEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlogeezTiptapEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlogeezTiptapEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
