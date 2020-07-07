import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EfisComponent } from './efis.component';

describe('EfisComponent', () => {
  let component: EfisComponent;
  let fixture: ComponentFixture<EfisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EfisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
