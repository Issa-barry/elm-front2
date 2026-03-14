import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./vehicules/vehicule-liste/vehicule-liste').then((c) => c.VehiculeListe),
        data: { breadcrumb: 'Vehicules' },
    },
    {
        path: 'new',
        loadComponent: () => import('./vehicules/vehicule-new/vehicule-new').then((c) => c.VehiculeNew),
        data: { breadcrumb: 'Nouveau produit' },
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./vehicules/vehicule-edit/vehicule-edit').then((c) => c.VehiculeEdit),
        data: { breadcrumb: 'Modifier le produit' },
    },
    {
        path: 'details/:id',
        loadComponent: () => import('./vehicules/vehicule-details/vehicule-details').then((c) => c.VehiculeDetails),
        data: { breadcrumb: 'Modifier le produit' },
    },
    {
        path: 'livreurs',
        loadChildren: () => import('@/app/pages/vehicules/livreurs/livreurs.routes')
    },

    { path: '**', redirectTo: '' },
] as Routes;
