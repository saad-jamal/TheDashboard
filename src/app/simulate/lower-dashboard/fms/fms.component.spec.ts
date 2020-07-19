import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FmsComponent } from './fms.component';

describe('FmsComponent', () => {
  let component: FmsComponent;
  let fixture: ComponentFixture<FmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
