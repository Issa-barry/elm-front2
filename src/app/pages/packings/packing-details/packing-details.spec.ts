import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingDetails } from './packing-details';

describe('PackingDetails', () => {
  let component: PackingDetails;
  let fixture: ComponentFixture<PackingDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackingDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackingDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
