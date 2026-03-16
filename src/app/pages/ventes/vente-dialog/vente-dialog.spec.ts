import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteDialog } from './vente-dialog';

describe('VenteDialog', () => {
  let component: VenteDialog;
  let fixture: ComponentFixture<VenteDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenteDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenteDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
