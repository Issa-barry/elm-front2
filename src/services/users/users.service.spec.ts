import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { UserService, CheckPhoneRequest } from './users.service';
import { environment } from 'src/environments/environment';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('UserService.checkPhone', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const expectedUrl = `${environment.apiUrl}/users/check-phone`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('retourne available=true avec normalized_phone', () => {
    const req: CheckPhoneRequest = { phone: '+224620000001', code_phone_pays: '+224' };
    let result: any;

    service.checkPhone(req).subscribe(r => (result = r));

    const httpReq = httpMock.expectOne(expectedUrl);
    expect(httpReq.request.method).toBe('POST');
    expect(httpReq.request.body).toEqual(req);

    httpReq.flush({
      success: true,
      message: 'OK',
      data: { available: true, normalized_phone: '+224620000001' },
    });

    expect(result.data.available).toBeTrue();
    expect(result.data.normalized_phone).toBe('+224620000001');
  });

  it('retourne available=false quand numéro déjà utilisé', () => {
    const req: CheckPhoneRequest = { phone: '+224620000002', code_phone_pays: '+224' };
    let result: any;

    service.checkPhone(req).subscribe(r => (result = r));
    httpMock.expectOne(expectedUrl).flush({
      success: true,
      message: 'OK',
      data: { available: false },
    });

    expect(result.data.available).toBeFalse();
    expect(result.data.normalized_phone).toBeUndefined();
  });

  it('propage une erreur HTTP 422', () => {
    const req: CheckPhoneRequest = { phone: 'invalid', code_phone_pays: '+224' };
    let errorStatus: number | undefined;

    service.checkPhone(req).subscribe({ error: (e) => (errorStatus = e.status) });
    httpMock.expectOne(expectedUrl).flush(
      { message: 'Validation failed', errors: { phone: ['Format invalide'] } },
      { status: 422, statusText: 'Unprocessable Entity' },
    );

    expect(errorStatus).toBe(422);
  });
});
