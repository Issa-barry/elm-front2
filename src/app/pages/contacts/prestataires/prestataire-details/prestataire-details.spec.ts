import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireDetails } from './prestataire-details';

describe('PrestataireDetails', () => {
  let component: PrestataireDetails;
  let fixture: ComponentFixture<PrestataireDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestataireDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestataireDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
