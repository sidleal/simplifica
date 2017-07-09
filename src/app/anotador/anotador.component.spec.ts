import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnotadorComponent } from './anotador.component';

import { RouterTestingModule } from '@angular/router/testing';

describe('AnotadorComponent', () => {
  let component: AnotadorComponent;
  let fixture: ComponentFixture<AnotadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [ AnotadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnotadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
