import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonToFormFormArrayComponent } from './json-to-form-form-array.component';

describe('JsonToFormFormArrayComponent', () => {
  let component: JsonToFormFormArrayComponent;
  let fixture: ComponentFixture<JsonToFormFormArrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JsonToFormFormArrayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JsonToFormFormArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
