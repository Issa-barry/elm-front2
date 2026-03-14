import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeNew } from './vehicule-new';

describe('VehiculeNew', () => {
  let component: VehiculeNew;
  let fixture: ComponentFixture<VehiculeNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
