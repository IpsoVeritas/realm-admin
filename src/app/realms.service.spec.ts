import { TestBed, inject } from '@angular/core/testing';

import { RealmsService } from './realms.service';

describe('RealmsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RealmsService]
    });
  });

  it('should be created', inject([RealmsService], (service: RealmsService) => {
    expect(service).toBeTruthy();
  }));
});
