import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeListe } from './vehicule-liste';

describe('VehiculeListe', () => {
  let component: VehiculeListe;
  let fixture: ComponentFixture<VehiculeListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeListe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
