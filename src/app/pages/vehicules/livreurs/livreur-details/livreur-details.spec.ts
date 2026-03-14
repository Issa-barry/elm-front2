import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurDetails } from './livreur-details';

describe('LivreurDetails', () => {
  let component: LivreurDetails;
  let fixture: ComponentFixture<LivreurDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreurDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreurDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
