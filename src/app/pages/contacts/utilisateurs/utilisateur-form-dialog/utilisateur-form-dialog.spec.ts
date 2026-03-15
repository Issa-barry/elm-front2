import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurFormDialog } from './utilisateur-form-dialog';

describe('UtilisateurFormDialog', () => {
  let component: UtilisateurFormDialog;
  let fixture: ComponentFixture<UtilisateurFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateurFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
