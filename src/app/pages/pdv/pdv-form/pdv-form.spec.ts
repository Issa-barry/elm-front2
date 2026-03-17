import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdvForm } from './pdv-form';

describe('PdvForm', () => {
  let component: PdvForm;
  let fixture: ComponentFixture<PdvForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdvForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdvForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
