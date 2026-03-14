import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireEdit } from './prestataire-edit';

describe('PrestataireEdit', () => {
  let component: PrestataireEdit;
  let fixture: ComponentFixture<PrestataireEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestataireEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestataireEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
