import { TestBed } from '@angular/core/testing';

import { OptionsSharingService } from './options-sharing.service';

describe('OptionsSharingService', () => {
  let service: OptionsSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OptionsSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
