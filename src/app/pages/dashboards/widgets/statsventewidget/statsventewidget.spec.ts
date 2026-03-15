import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Statsventewidget } from './statsventewidget';

describe('Statsventewidget', () => {
  let component: Statsventewidget;
  let fixture: ComponentFixture<Statsventewidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Statsventewidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Statsventewidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
