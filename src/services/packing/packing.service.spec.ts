import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PackingService } from './packing.service';
import { environment } from 'src/environments/environment';
import { Packing, CreatePackingDto, UpdatePackingDto } from '@/models/packing.model';

const API = `${environment.apiUrl}/packings`;

const mockPacking: Packing = {
  id: 1,
  prestataire_id: 2,
  reference: 'PACK-20260205-0001',
  date: '2026-02-05',
  nb_rouleaux: 890,
  prix_par_rouleau: 9,
  montant: 8010,
  statut: 'valide',
  facture_id: null,
  notes: null,
  created_at: '2026-02-05T10:00:00Z',
  updated_at: '2026-02-05T10:00:00Z',
  deleted_at: null,
};

describe('PackingService', () => {
  let service: PackingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(PackingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // ── getPackings ──────────────────────────────────────────────────────────

  it('getPackings() envoie GET /packings sans params', () => {
    service.getPackings().subscribe();
    const req = http.expectOne(API);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [mockPacking] });
  });

  it('getPackings() passe le filtre prestataire_id', () => {
    service.getPackings({ prestataire_id: 2 }).subscribe();
    const req = http.expectOne(r => r.url === API && r.params.get('prestataire_id') === '2');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('getPackings() passe le filtre statut', () => {
    service.getPackings({ statut: 'valide' }).subscribe();
    const req = http.expectOne(r => r.url === API && r.params.get('statut') === 'valide');
    req.flush({ success: true, message: '', data: [] });
  });

  it('getPackings() passe les filtres de période', () => {
    service.getPackings({ date_debut: '2026-01-01', date_fin: '2026-01-31' }).subscribe();
    const req = http.expectOne(r =>
      r.url === API &&
      r.params.get('date_debut') === '2026-01-01' &&
      r.params.get('date_fin') === '2026-01-31'
    );
    req.flush({ success: true, message: '', data: [] });
  });

  it('getPackings() passe non_payes=true', () => {
    service.getPackings({ non_payes: true }).subscribe();
    const req = http.expectOne(r => r.url === API && r.params.get('non_payes') === 'true');
    req.flush({ success: true, message: '', data: [] });
  });

  it('getPackings() passe les params de pagination', () => {
    service.getPackings({ page: 2, per_page: 25 }).subscribe();
    const req = http.expectOne(r =>
      r.url === API &&
      r.params.get('page') === '2' &&
      r.params.get('per_page') === '25'
    );
    req.flush({ success: true, message: '', data: [] });
  });

  // ── getPacking ───────────────────────────────────────────────────────────

  it('getPacking(id) envoie GET /packings/:id et retourne le packing', () => {
    service.getPacking(1).subscribe(res => expect(res.data).toEqual(mockPacking));
    const req = http.expectOne(`${API}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: mockPacking });
  });

  // ── createPacking ────────────────────────────────────────────────────────

  it('createPacking() envoie POST /packings avec le bon body', () => {
    const dto: CreatePackingDto = {
      prestataire_id: 2,
      date: '2026-02-05',
      nb_rouleaux: 890,
      prix_par_rouleau: 9,
    };
    service.createPacking(dto).subscribe(res => expect(res.data).toEqual(mockPacking));
    const req = http.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ success: true, message: 'Créé', data: mockPacking });
  });

  it('createPacking() peut inclure statut et notes', () => {
    const dto: CreatePackingDto = {
      prestataire_id: 2,
      date: '2026-02-05',
      nb_rouleaux: 100,
      prix_par_rouleau: 9,
      statut: 'a_valider',
      notes: 'Test',
    };
    service.createPacking(dto).subscribe();
    const req = http.expectOne(API);
    expect(req.request.body.statut).toBe('a_valider');
    expect(req.request.body.notes).toBe('Test');
    req.flush({ success: true, message: '', data: mockPacking });
  });

  // ── updatePacking ────────────────────────────────────────────────────────

  it('updatePacking() envoie PUT /packings/:id avec le bon body', () => {
    const dto: UpdatePackingDto = { nb_rouleaux: 100, statut: 'a_valider' };
    service.updatePacking(1, dto).subscribe(res => expect(res.data.nb_rouleaux).toBe(100));
    const req = http.expectOne(`${API}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush({ success: true, message: '', data: { ...mockPacking, nb_rouleaux: 100 } });
  });

  // ── changeStatut ─────────────────────────────────────────────────────────

  it('changeStatut() envoie PATCH /packings/:id/statut', () => {
    service.changeStatut(1, { statut: 'annule' }).subscribe();
    const req = http.expectOne(`${API}/1/statut`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ statut: 'annule' });
    req.flush({ success: true, message: '', data: { ...mockPacking, statut: 'annule' } });
  });

  // ── deletePacking ────────────────────────────────────────────────────────

  it('deletePacking() envoie DELETE /packings/:id', () => {
    service.deletePacking(1).subscribe(res => expect(res.success).toBeTrue());
    const req = http.expectOne(`${API}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, message: 'Supprimé', data: null });
  });

  // ── searchPackings ───────────────────────────────────────────────────────

  it('searchPackings() passe le param search', () => {
    service.searchPackings('Aly').subscribe();
    const req = http.expectOne(r => r.url === API && r.params.get('search') === 'Aly');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [mockPacking] });
  });

  // ── getPackingsByPrestataire ─────────────────────────────────────────────

  it('getPackingsByPrestataire() passe prestataire_id', () => {
    service.getPackingsByPrestataire(2).subscribe();
    const req = http.expectOne(r => r.url === API && r.params.get('prestataire_id') === '2');
    req.flush({ success: true, message: '', data: [mockPacking] });
  });

  // ── getPackingsByStatut ──────────────────────────────────────────────────

  it('getPackingsByStatut() passe statut', () => {
    service.getPackingsByStatut('valide').subscribe();
    const req = http.expectOne(r => r.url === API && r.params.get('statut') === 'valide');
    req.flush({ success: true, message: '', data: [mockPacking] });
  });

  // ── getPackingsNonPayes ──────────────────────────────────────────────────

  it('getPackingsNonPayes() passe non_payes=true', () => {
    service.getPackingsNonPayes().subscribe();
    const req = http.expectOne(r => r.url === API && r.params.get('non_payes') === 'true');
    req.flush({ success: true, message: '', data: [] });
  });

  // ── getPackingsByPeriode ─────────────────────────────────────────────────

  it('getPackingsByPeriode() passe date_debut et date_fin', () => {
    service.getPackingsByPeriode('2026-01-01', '2026-01-31').subscribe();
    const req = http.expectOne(r =>
      r.url === API &&
      r.params.get('date_debut') === '2026-01-01' &&
      r.params.get('date_fin') === '2026-01-31'
    );
    req.flush({ success: true, message: '', data: [] });
  });

  // ── getPackingsPaginated ─────────────────────────────────────────────────

  it('getPackingsPaginated() envoie page et per_page', () => {
    service.getPackingsPaginated(2, 25).subscribe();
    const req = http.expectOne(r =>
      r.url === API &&
      r.params.get('page') === '2' &&
      r.params.get('per_page') === '25'
    );
    req.flush({
      success: true, message: '',
      data: { current_page: 2, data: [], first_page_url: '', from: 0, last_page: 1,
        last_page_url: '', links: [], next_page_url: null, path: '',
        per_page: 25, prev_page_url: null, to: 0, total: 0 },
    });
  });

  it('getPackingsPaginated() passe les filtres optionnels', () => {
    service.getPackingsPaginated(1, 10, { statut: 'valide', prestataire_id: 3 }).subscribe();
    const req = http.expectOne(r =>
      r.url === API &&
      r.params.get('statut') === 'valide' &&
      r.params.get('prestataire_id') === '3'
    );
    req.flush({
      success: true, message: '',
      data: { current_page: 1, data: [], first_page_url: '', from: 0, last_page: 1,
        last_page_url: '', links: [], next_page_url: null, path: '',
        per_page: 10, prev_page_url: null, to: 0, total: 0 },
    });
  });
});
