import { TestBed, inject } from '@angular/core/testing';

import { BootmodeGuardService } from './bootmode-guard.service';

describe('BootmodeGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BootmodeGuardService]
    });
  });

  it('should be created', inject([BootmodeGuardService], (service: BootmodeGuardService) => {
    expect(service).toBeTruthy();
  }));
});
