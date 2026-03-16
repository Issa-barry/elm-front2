import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./vente-liste/vente-liste').then((c) => c.VenteListe),
        data: { breadcrumb: 'Ventes' },
    },
    {
        path: 'new',
        loadComponent: () => import('./vente-new/vente-new').then((c) => c.VenteNew),
        data: { breadcrumb: 'Nouvelle vente' },
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./vente-edit/vente-edit').then((c) => c.VenteEdit),
        data: { breadcrumb: 'Modifier la vente' },
    },
    {
        path: 'details/:id',
        loadComponent: () => import('./vente-details/vente-details').then((c) => c.VenteDetails),
        data: { breadcrumb: 'Details vente' },
    },

    { path: '**', redirectTo: '' },
] as Routes;
