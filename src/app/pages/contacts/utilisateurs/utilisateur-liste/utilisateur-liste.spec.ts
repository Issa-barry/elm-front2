import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurListe } from './utilisateur-liste';

describe('UtilisateurListe', () => {
  let component: UtilisateurListe;
  let fixture: ComponentFixture<UtilisateurListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurListe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateurListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
