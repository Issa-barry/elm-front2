import { Routes } from '@angular/router';
import { PackingListe } from './packing-liste/packing-liste';
import { PackingNew } from './packing-new/packing-new';
import { PackingEdit } from './packing-edit/packing-edit';
import { PackingDetails } from './packing-details/packing-details';

export default [
   
    {
           path: '',
           component: PackingListe,
           data: { breadcrumb: 'Packings liste' },
       },
       {
           path: 'new',
           component: PackingNew,
           data: { breadcrumb: 'Nouveau packing' },
       },
       {
           path: 'edit/:id',
           component: PackingEdit,
           data: { breadcrumb: 'Modifier le packing' },
       },
       {
           path: 'details/:id',
           component: PackingDetails,
           data: { breadcrumb: 'Details du packing' },
       },
    { path: '**', redirectTo: '' },
] as Routes;
