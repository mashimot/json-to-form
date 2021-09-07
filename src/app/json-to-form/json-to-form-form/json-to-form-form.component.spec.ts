import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonToFormFormComponent } from './json-to-form-form.component';

describe('JsonToFormFormComponent', () => {
  let component: JsonToFormFormComponent;
  let fixture: ComponentFixture<JsonToFormFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JsonToFormFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JsonToFormFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
