import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProprietaireDetails } from './proprietaire-details';

describe('ProprietaireDetails', () => {
  let component: ProprietaireDetails;
  let fixture: ComponentFixture<ProprietaireDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProprietaireDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProprietaireDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
