import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteEdit } from './vente-edit';

describe('VenteEdit', () => {
  let component: VenteEdit;
  let fixture: ComponentFixture<VenteEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenteEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenteEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
