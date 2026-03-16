import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteListe } from './vente-liste';

describe('VenteListe', () => {
  let component: VenteListe;
  let fixture: ComponentFixture<VenteListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenteListe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenteListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
