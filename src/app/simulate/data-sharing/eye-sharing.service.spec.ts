import { TestBed } from '@angular/core/testing';

import { EyeSharingService } from './eye-sharing.service';

describe('EyeSharingService', () => {
  let service: EyeSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EyeSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
