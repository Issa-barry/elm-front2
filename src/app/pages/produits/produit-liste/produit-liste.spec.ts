import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitListe } from './produit-liste';

describe('ProduitListe', () => {
  let component: ProduitListe;
  let fixture: ComponentFixture<ProduitListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitListe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
