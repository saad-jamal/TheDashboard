import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PfdComponent } from './pfd.component';

describe('PfdComponent', () => {
  let component: PfdComponent;
  let fixture: ComponentFixture<PfdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PfdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
