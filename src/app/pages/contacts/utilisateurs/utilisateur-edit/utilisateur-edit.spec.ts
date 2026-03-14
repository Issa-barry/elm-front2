import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurEdit } from './utilisateur-edit';

describe('UtilisateurEdit', () => {
  let component: UtilisateurEdit;
  let fixture: ComponentFixture<UtilisateurEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateurEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
