import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingNew } from './packing-new';

describe('PackingNew', () => {
  let component: PackingNew;
  let fixture: ComponentFixture<PackingNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackingNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackingNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
