import { Routes } from '@angular/router';
import { PrestataireListe } from './prestataire-liste/prestataire-liste';
import { PrestataireNew } from './prestataire-new/prestataire-new';
import { PrestataireEdit } from './prestataire-edit/prestataire-edit';
import { PrestataireDetails } from './prestataire-details/prestataire-details';

export default [
    {
        path: '',
        component: PrestataireListe,
        data: { breadcrumb: 'Prestataires' },
    },
    {
        path: 'new',
        component: PrestataireNew,
        data: { breadcrumb: 'Nouveau prestataire' },
    },
    {
        path: 'edit/:id',
        component: PrestataireEdit,
        data: { breadcrumb: 'Modifier le prestataire' },
    },
    {
        path: 'details/:id',
        component: PrestataireDetails,
        data: { breadcrumb: 'Details du prestataire' },
    },

    { path: '**', redirectTo: '' },
] as Routes;
