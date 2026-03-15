import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingListe } from './packing-liste';

describe('PackingListe', () => {
  let component: PackingListe;
  let fixture: ComponentFixture<PackingListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackingListe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackingListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
