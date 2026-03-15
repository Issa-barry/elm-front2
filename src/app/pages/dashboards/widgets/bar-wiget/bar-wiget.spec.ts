import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarWiget } from './bar-wiget';

describe('BarWiget', () => {
  let component: BarWiget;
  let fixture: ComponentFixture<BarWiget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarWiget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarWiget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
