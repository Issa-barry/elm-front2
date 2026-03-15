import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurNew } from './utilisateur-new';

describe('UtilisateurNew', () => {
  let component: UtilisateurNew;
  let fixture: ComponentFixture<UtilisateurNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateurNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
