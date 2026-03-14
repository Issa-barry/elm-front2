import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProprietaireNew } from './proprietaire-new';

describe('ProprietaireNew', () => {
  let component: ProprietaireNew;
  let fixture: ComponentFixture<ProprietaireNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProprietaireNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProprietaireNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
