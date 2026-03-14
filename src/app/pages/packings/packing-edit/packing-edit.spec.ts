import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingEdit } from './packing-edit';

describe('PackingEdit', () => {
  let component: PackingEdit;
  let fixture: ComponentFixture<PackingEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackingEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackingEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
