import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./produit-liste/produit-liste').then((c) => c.ProduitListe),
        data: { breadcrumb: 'Vehicules' },
    },
    {
        path: 'new',
        loadComponent: () => import('./produit-new/produit-new').then((c) => c.ProduitNew),
        data: { breadcrumb: 'Nouveau produit' },
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./produit-edit/produit-edit').then((c) => c.ProduitEdit),
        data: { breadcrumb: 'Modifier le produit' },
    },
    { path: '**', redirectTo: '' },
] as Routes;
