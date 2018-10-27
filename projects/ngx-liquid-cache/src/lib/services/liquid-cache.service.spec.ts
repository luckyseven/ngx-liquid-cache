import { TestBed } from '@angular/core/testing';

import { LiquidCacheService } from './liquid-cache.service';

describe('CacheService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LiquidCacheService = TestBed.get(LiquidCacheService);
    expect(service).toBeTruthy();
  });
});
