import { TestBed } from '@angular/core/testing';

import { MiscSharingService } from './misc-sharing.service';

describe('MiscSharingService', () => {
  let service: MiscSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MiscSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
