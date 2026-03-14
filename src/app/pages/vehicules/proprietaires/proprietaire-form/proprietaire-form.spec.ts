import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProprietaireForm } from './proprietaire-form';

describe('ProprietaireForm', () => {
  let component: ProprietaireForm;
  let fixture: ComponentFixture<ProprietaireForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProprietaireForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProprietaireForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
