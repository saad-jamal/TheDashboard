import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpperEicasComponent } from './upper-eicas.component';

describe('UpperEicasComponent', () => {
  let component: UpperEicasComponent;
  let fixture: ComponentFixture<UpperEicasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpperEicasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpperEicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
