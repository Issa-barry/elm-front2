import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteNew } from './vente-new';

describe('VenteNew', () => {
  let component: VenteNew;
  let fixture: ComponentFixture<VenteNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenteNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenteNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
