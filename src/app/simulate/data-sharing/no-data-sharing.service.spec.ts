import { TestBed } from '@angular/core/testing';

import { NoDataSharingService } from './no-data-sharing.service';

describe('NoDataSharingService', () => {
  let service: NoDataSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoDataSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
