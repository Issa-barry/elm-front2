import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurDetails } from './utilisateur-details';

describe('UtilisateurDetails', () => {
  let component: UtilisateurDetails;
  let fixture: ComponentFixture<UtilisateurDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateurDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
