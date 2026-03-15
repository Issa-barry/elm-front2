import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitEdit } from './produit-edit';

describe('ProduitEdit', () => {
  let component: ProduitEdit;
  let fixture: ComponentFixture<ProduitEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
