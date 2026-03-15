import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireListe } from './prestataire-liste';

describe('PrestataireListe', () => {
  let component: PrestataireListe;
  let fixture: ComponentFixture<PrestataireListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestataireListe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestataireListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
