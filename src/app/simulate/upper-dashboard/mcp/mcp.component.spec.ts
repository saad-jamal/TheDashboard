import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { McpComponent } from './mcp.component';

describe('McpComponent', () => {
  let component: McpComponent;
  let fixture: ComponentFixture<McpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ McpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(McpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
