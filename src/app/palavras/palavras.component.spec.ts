import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalavrasComponent } from './palavras.component';

describe('PalavrasComponent', () => {
  let component: PalavrasComponent;
  let fixture: ComponentFixture<PalavrasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PalavrasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalavrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
