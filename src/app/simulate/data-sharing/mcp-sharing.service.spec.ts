import { TestBed } from '@angular/core/testing';

import { McpSharingService } from './mcp-sharing.service';

describe('McpSharingService', () => {
  let service: McpSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(McpSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
