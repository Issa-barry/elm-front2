import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldeCardWidget } from './solde-card-widget';

describe('SoldeCardWidget', () => {
  let component: SoldeCardWidget;
  let fixture: ComponentFixture<SoldeCardWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoldeCardWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoldeCardWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
