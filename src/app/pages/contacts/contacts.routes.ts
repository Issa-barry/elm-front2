import { Routes } from '@angular/router';

export default [
    // {
    //     path: '',
    //     loadComponent: () => import('./vehicules/vehicule-liste/vehicule-liste').then((c) => c.VehiculeListe),
    //     data: { breadcrumb: 'Vehicules' },
    // },
  
    {
        path: 'prestataires',
        loadChildren: () => import('@/app/pages/contacts/prestataires/prestataires.routes'),
    },
 

    { path: '**', redirectTo: '' },
] as Routes;
