import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MandatesComponent } from './mandates.component';

describe('MandatesComponent', () => {
  let component: MandatesComponent;
  let fixture: ComponentFixture<MandatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MandatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MandatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
