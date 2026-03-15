import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ventedashboard } from './ventedashboard';

describe('Ventedashboard', () => {
  let component: Ventedashboard;
  let fixture: ComponentFixture<Ventedashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ventedashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ventedashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
