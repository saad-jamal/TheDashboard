import { TestBed } from '@angular/core/testing';

import { NdSharingService } from './nd-sharing.service';

describe('NdSharingService', () => {
  let service: NdSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NdSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
