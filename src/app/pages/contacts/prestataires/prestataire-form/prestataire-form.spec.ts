import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireForm } from './prestataire-form';

describe('PrestataireForm', () => {
  let component: PrestataireForm;
  let fixture: ComponentFixture<PrestataireForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestataireForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestataireForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
