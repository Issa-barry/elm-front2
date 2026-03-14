import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitNew } from './produit-new';

describe('ProduitNew', () => {
  let component: ProduitNew;
  let fixture: ComponentFixture<ProduitNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
