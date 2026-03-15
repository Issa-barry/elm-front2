import { Routes } from '@angular/router';

export default [
   
    {
        path: 'prestataires',
        loadChildren: () => import('@/app/pages/contacts/prestataires/prestataires.routes'),
    },

     {
        path: 'utilisateurs',
        loadChildren: () => import('@/app/pages/contacts/utilisateurs/utilisateurs.routes'),
    },
 
 

    { path: '**', redirectTo: '' },
] as Routes;
