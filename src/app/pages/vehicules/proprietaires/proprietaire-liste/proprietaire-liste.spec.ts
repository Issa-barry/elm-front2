import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProprietaireListe } from './proprietaire-liste';

describe('ProprietaireListe', () => {
  let component: ProprietaireListe;
  let fixture: ComponentFixture<ProprietaireListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProprietaireListe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProprietaireListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
