import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProprietaireEdit } from './proprietaire-edit';

describe('ProprietaireEdit', () => {
  let component: ProprietaireEdit;
  let fixture: ComponentFixture<ProprietaireEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProprietaireEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProprietaireEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
