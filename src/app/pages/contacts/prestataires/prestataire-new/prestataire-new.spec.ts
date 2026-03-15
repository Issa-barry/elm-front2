import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireNew } from './prestataire-new';

describe('PrestataireNew', () => {
  let component: PrestataireNew;
  let fixture: ComponentFixture<PrestataireNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestataireNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestataireNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
