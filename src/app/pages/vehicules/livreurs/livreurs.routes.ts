import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./livreur-liste/livreur-liste').then((c) => c.LivreurListe),
        data: { breadcrumb: 'Livreurs' },
    },
    {
        path: 'new',
        loadComponent: () => import('./livreur-new/livreur-new').then((c) => c.LivreurNew),
        data: { breadcrumb: 'Nouveau livreur' },
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./livreur-edit/livreur-edit').then((c) => c.LivreurEdit),
        data: { breadcrumb: 'Modifier le livreur' },
    },
    {
        path: 'details/:id',
        loadComponent: () => import('./livreur-details/livreur-details').then((c) => c.LivreurDetails),
        data: { breadcrumb: 'Details du livreur' },
    },
    { path: '**', redirectTo: '' },
] as Routes;
