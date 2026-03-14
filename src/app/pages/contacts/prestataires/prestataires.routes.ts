import { Routes } from '@angular/router';
import { PrestataireListe } from './prestataire-liste/prestataire-liste';

export default [
    {
        path: '',
        component: PrestataireListe,
         data: { breadcrumb: 'Prestatire' },
    },
  
    // {
    //     path: 'prestataires',
    //     loadChildren: () => import('@/app/pages/vehicules/livreurs/livreurs.routes')
    // },
 

    { path: '**', redirectTo: '' },
] as Routes;
