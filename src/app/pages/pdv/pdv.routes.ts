import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./pdv/pdv').then((c) => c.Pdv),
        data: { breadcrumb: 'Ventes' },
    },
 

    { path: '**', redirectTo: '' },
] as Routes;
