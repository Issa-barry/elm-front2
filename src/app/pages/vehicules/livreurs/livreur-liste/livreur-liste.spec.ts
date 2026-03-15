import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurListe } from './livreur-liste';

describe('LivreurListe', () => {
  let component: LivreurListe;
  let fixture: ComponentFixture<LivreurListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreurListe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreurListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
