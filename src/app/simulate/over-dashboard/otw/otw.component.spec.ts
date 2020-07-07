import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtwComponent } from './otw.component';

describe('OtwComponent', () => {
  let component: OtwComponent;
  let fixture: ComponentFixture<OtwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
