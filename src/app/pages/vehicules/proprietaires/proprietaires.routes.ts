import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./proprietaire-liste/proprietaire-liste').then((c) => c.ProprietaireListe),
        data: { breadcrumb: 'Proprietaires' },
    },
    {
        path: 'new',
        loadComponent: () => import('./proprietaire-new/proprietaire-new').then((c) => c.ProprietaireNew),
        data: { breadcrumb: 'Nouveau proprietaire' },
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./proprietaire-edit/proprietaire-edit').then((c) => c.ProprietaireEdit),
        data: { breadcrumb: 'Modifier le proprietaire' },
    },
    {
        path: 'details/:id',
        loadComponent: () => import('./proprietaire-details/proprietaire-details').then((c) => c.ProprietaireDetails),
        data: { breadcrumb: 'Details du proprietaire' },
    },
    { path: '**', redirectTo: '' },
] as Routes;
