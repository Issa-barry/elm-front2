import { Routes } from '@angular/router';
import { UtilisateurListe } from './utilisateur-liste/utilisateur-liste';
import { UtilisateurNew } from './utilisateur-new/utilisateur-new';
import { UtilisateurEdit } from './utilisateur-edit/utilisateur-edit';
import { UtilisateurDetails } from './utilisateur-details/utilisateur-details';

export default [
    {
        path: '',
        component: UtilisateurListe,
        data: { breadcrumb: 'Utilisateurs' },
    },
    {
        path: 'new',
        component: UtilisateurNew,
        data: { breadcrumb: 'Nouveau utilisateur' },
    },
    {
        path: 'edit/:id',
        component: UtilisateurEdit,
        data: { breadcrumb: 'Modifier le utilisateur' },
    },
    {
        path: 'details/:id',
        component: UtilisateurDetails,
        data: { breadcrumb: 'Details du utilisateur' },
    },

    { path: '**', redirectTo: '' },
] as Routes;
