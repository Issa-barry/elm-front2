import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const TOKEN_KEY = 'access_token';
const USER_KEY  = 'user';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token      = sessionStorage.getItem(TOKEN_KEY);
    const isFormData = req.body instanceof FormData;
    const router     = inject(Router);

    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const authReq = req.clone({ setHeaders: headers });

    return next(authReq).pipe(
        catchError((error: unknown) => {
            if (
                error instanceof HttpErrorResponse &&
                error.status === 401 &&
                !authReq.url.includes('/auth/login')
            ) {
                sessionStorage.removeItem(TOKEN_KEY);
                sessionStorage.removeItem(USER_KEY);

                const currentUrl = router.url;
                if (!currentUrl.startsWith('/auth/login')) {
                    router.navigate(['/auth/login'], {
                        queryParams: { returnUrl: currentUrl },
                        replaceUrl: true,
                    });
                }
            }

            return throwError(() => error);
        })
    );
};
