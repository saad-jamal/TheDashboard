import { TestBed } from '@angular/core/testing';

import { SimulateService } from './simulate.service';

describe('SimulateService', () => {
  let service: SimulateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimulateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
