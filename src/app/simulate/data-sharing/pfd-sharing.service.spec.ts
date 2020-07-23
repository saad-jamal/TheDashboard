import { TestBed } from '@angular/core/testing';

import { PfdSharingService } from './pfd-sharing.service';

describe('PfdSharingService', () => {
  let service: PfdSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PfdSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
