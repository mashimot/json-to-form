import { TestBed } from '@angular/core/testing';

import { JsonToFormService } from './json-to-form.service';

describe('JsonToFormService', () => {
  let service: JsonToFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonToFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
