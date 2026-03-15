import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurNew } from './livreur-new';

describe('LivreurNew', () => {
  let component: LivreurNew;
  let fixture: ComponentFixture<LivreurNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreurNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreurNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
