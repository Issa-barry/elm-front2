import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeDetails } from './vehicule-details';

describe('VehiculeDetails', () => {
  let component: VehiculeDetails;
  let fixture: ComponentFixture<VehiculeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
