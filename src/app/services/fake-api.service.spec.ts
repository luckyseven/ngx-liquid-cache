import { TestBed } from '@angular/core/testing';

import { FakeApiService } from './fake-api.service';

describe('FakeApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FakeApiService = TestBed.get(FakeApiService);
    expect(service).toBeTruthy();
  });
});
