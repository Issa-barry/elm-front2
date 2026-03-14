import { TestBed } from '@angular/core/testing';

import { MeResponse } from '@/models/usine.model';
import { UsineContextService } from './usine-context.service';

const ME_NON_SIEGE: MeResponse = {
  user: {},
  roles: ['gestionnaire'],
  permissions: ['produits.read'],
  accessible_sites: [
    { id: 1, nom: 'Site Alpha' },
    { id: 2, nom: 'Site Beta' },
  ],
  default_site_id: 1,
  current_site_id: 1,
  is_siege_user: false,
};

const ME_SIEGE: MeResponse = {
  user: {},
  roles: ['admin_entreprise'],
  permissions: [],
  accessible_sites: [
    { id: 1, nom: 'Site Alpha' },
    { id: 3, nom: 'Site Gamma' },
  ],
  default_site_id: null,
  current_site_id: null,
  is_siege_user: true,
};

describe('UsineContextService', () => {
  let service: UsineContextService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsineContextService);
  });

  afterEach(() => sessionStorage.clear());

  it('hydrate non-siege: current = default', () => {
    service.hydrateFromMe(ME_NON_SIEGE);
    expect(service.currentUsineId()).toBe(1);
    expect(service.isSiegeUser()).toBeFalse();
    expect(service.isConsolidated()).toBeFalse();
  });

  it('hydrate siege sans current: mode consolide', () => {
    service.hydrateFromMe(ME_SIEGE);
    expect(service.isSiegeUser()).toBeTrue();
    expect(service.isConsolidated()).toBeTrue();
    expect(service.currentUsineId()).toBeNull();
    expect(service.headerUsineId()).toBe('all');
  });

  it('headerUsineId retourne id en mode normal', () => {
    service.hydrateFromMe(ME_NON_SIEGE);
    expect(service.headerUsineId()).toBe(1);
  });

  it('switchUsine change le site et quitte le mode consolide', () => {
    service.hydrateFromMe(ME_SIEGE);
    service.switchUsine(3);
    expect(service.currentUsineId()).toBe(3);
    expect(service.isConsolidated()).toBeFalse();
    expect(service.headerUsineId()).toBe(3);
  });

  it('enableConsolidatedView fonctionne pour siege', () => {
    service.hydrateFromMe({ ...ME_SIEGE, current_site_id: 1 });
    service.enableConsolidatedView();
    expect(service.isConsolidated()).toBeTrue();
    expect(service.headerUsineId()).toBe('all');
  });

  it('enableConsolidatedView est ignore pour non-siege', () => {
    service.hydrateFromMe(ME_NON_SIEGE);
    service.enableConsolidatedView();
    expect(service.isConsolidated()).toBeFalse();
    expect(service.headerUsineId()).toBe(1);
  });

  it('fallbackToDefault revient sur default', () => {
    service.hydrateFromMe(ME_NON_SIEGE);
    service.switchUsine(2);
    service.fallbackToDefault();
    expect(service.currentUsineId()).toBe(1);
  });

  it('persiste et se restaure', () => {
    service.hydrateFromMe(ME_NON_SIEGE);
    service.switchUsine(2);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const service2 = TestBed.inject(UsineContextService);

    expect(service2.currentUsineId()).toBe(2);
    expect(service2.isSiegeUser()).toBeFalse();
  });

  it('clear reinitialise et purge sessionStorage', () => {
    service.hydrateFromMe(ME_NON_SIEGE);
    service.clear();

    expect(service.currentUsineId()).toBeNull();
    expect(service.isSiegeUser()).toBeFalse();
    expect(sessionStorage.getItem('site_context')).toBeNull();
    expect(sessionStorage.getItem('usine_context')).toBeNull();
  });
});
