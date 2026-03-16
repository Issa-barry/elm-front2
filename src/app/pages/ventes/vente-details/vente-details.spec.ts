import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteDetails } from './vente-details';

describe('VenteDetails', () => {
  let component: VenteDetails;
  let fixture: ComponentFixture<VenteDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenteDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenteDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
