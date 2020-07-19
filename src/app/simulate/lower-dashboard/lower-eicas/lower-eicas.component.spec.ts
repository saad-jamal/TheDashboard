import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LowerEicasComponent } from './lower-eicas.component';

describe('LowerEicasComponent', () => {
  let component: LowerEicasComponent;
  let fixture: ComponentFixture<LowerEicasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LowerEicasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LowerEicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
