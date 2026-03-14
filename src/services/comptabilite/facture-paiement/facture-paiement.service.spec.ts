import { TestBed } from '@angular/core/testing';

import { FacturePaiementService } from './facture-paiement.service';

describe('FacturePaiementService', () => {
  let service: FacturePaiementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacturePaiementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
