import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurForm } from './livreur-form';

describe('LivreurForm', () => {
  let component: LivreurForm;
  let fixture: ComponentFixture<LivreurForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreurForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreurForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
