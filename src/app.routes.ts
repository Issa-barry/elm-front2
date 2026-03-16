import { Routes } from '@angular/router';
import { AppLayout } from '@/app/layout/components/app.layout';
import { Landing } from '@/app/pages/landing/landing';
import { Notfound } from '@/app/pages/notfound/notfound';
import { authGuard } from '@/app/guards/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [

            {
                path: '',
                loadComponent: () => import('./app/pages/dashboards/ventedashboard/ventedashboard').then((c) => c.Ventedashboard),
                data: { breadcrumb: 'Ventes Dashboard' }
            },

            {
                path: 'stats',
                loadComponent: () => import('./app/pages/dashboards/stats-dashboard/stats-dashboard').then((c) => c.StatsDashboard),
                data: { breadcrumb: 'Stats Dashboard' }
            },

            {
                path: 'banking',
                loadComponent: () => import('./app/pages/dashboards/bankingdashboard').then((c) => c.BankingDashboard),
                data: { breadcrumb: 'Banking Dashboard' }
            },

            {
                path: 'uikit',
                data: { breadcrumb: 'UI Kit' },
                loadChildren: () => import('@/app/pages/uikit/uikit.routes')
            },
            {
                path: 'documentation',
                data: { breadcrumb: 'Documentation' },
                loadComponent: () => import('./app/pages/documentation/documentation').then((c) => c.Documentation)
            },
            {
                path: 'pages',
                loadChildren: () => import('@/app/pages/pages.routes')
            },
            {
                path: 'produits',
                loadChildren: () => import('@/app/pages/produits/produits.routes')
            },
            {
                path: 'vehicules',
                loadChildren: () => import('@/app/pages/vehicules/vehicules.routes')
            },
            {
                path: 'contacts',
                loadChildren: () => import('@/app/pages/contacts/contacts.routes')
            },
            {
                path: 'packings',
                loadChildren: () => import('@/app/pages/packings/packings.routes')
            },
             {
                path: 'ventes',
                loadChildren: () => import('@/app/pages/ventes/ventes.routes')
            },
            {
                path: 'apps',
                loadChildren: () => import('@/app/apps/apps.routes'),
                data: { breadcrumb: 'Apps' }
            },

            {
                path: 'blocks',
                data: { breadcrumb: 'Free Blocks' },
                loadChildren: () => import('./app/pages/blocks/blocks.routes')
            },
            {
                path: 'ecommerce',
                loadChildren: () => import('@/app/pages/ecommerce/ecommerce.routes'),
                data: { breadcrumb: 'E-Commerce' }
            },
            {
                path: 'profile',
                loadChildren: () => import('@/app/pages/usermanagement/usermanagement.routes')
            },
            {
                path: 'produits',
                data: { breadcrumb: 'Produits' },
                loadChildren: () => import('@/app/pages/produits/produits.routes')
            }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    {
        path: 'auth',
        loadChildren: () => import('@/app/pages/auth/auth.routes')
    },
    { path: '**', redirectTo: '/notfound' }
];
