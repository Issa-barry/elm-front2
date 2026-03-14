import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurEdit } from './livreur-edit';

describe('LivreurEdit', () => {
  let component: LivreurEdit;
  let fixture: ComponentFixture<LivreurEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreurEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreurEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
