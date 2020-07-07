import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OffAoiComponent } from './off-aoi.component';

describe('OffAoiComponent', () => {
  let component: OffAoiComponent;
  let fixture: ComponentFixture<OffAoiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OffAoiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OffAoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
