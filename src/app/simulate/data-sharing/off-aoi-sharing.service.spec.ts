import { TestBed } from '@angular/core/testing';

import { OffAoiSharingService } from './off-aoi-sharing.service';

describe('OffAoiSharingService', () => {
  let service: OffAoiSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OffAoiSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
