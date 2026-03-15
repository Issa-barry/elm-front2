import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonughtWiget } from './donught-wiget';

describe('DonughtWiget', () => {
  let component: DonughtWiget;
  let fixture: ComponentFixture<DonughtWiget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonughtWiget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonughtWiget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
