import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SenterComponent } from './senter.component';

describe('SenterComponent', () => {
  let component: SenterComponent;
  let fixture: ComponentFixture<SenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
