import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `
})
export class AppMenu {
    model: any[] = [
        {
            label: 'Dashboards',
            icon: 'pi pi-home',
            path: '/dashboards',
            items: [
                {
                    label: 'Stats-ventes',
                    icon: 'pi pi-fw pi-home',
                    routerLink: ['/']
                },
                {
                    label: 'Stats',
                    icon: 'pi pi-fw pi-image',
                    routerLink: ['/dashboard-banking']
                }
            ]
        },
        {
            label: 'Moduels',
            icon: 'pi pi-th-large',
            path: '/apps',
            items: [
               {
                    label: 'Contacts',
                    icon: 'pi pi-fw pi-comment',
                    path: '/apps/cms',
                    items: [
                        {
                            label: 'Prestataires',
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/apps/cms/detail']
                        },
                        {
                            label: 'Utilisateurs',
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/apps/cms/detail2']
                        },
                        
                    ]
                },

                {
                    label: 'Packing',
                    icon: 'pi pi-fw pi-comments',
                    routerLink: ['/apps/chat']
                },
                {
                    label: 'Produits',
                    icon: 'pi pi-fw pi-folder',
                    routerLink: ['/apps/files']
                },

              
                 {
                    label: 'Véhicules',
                    icon: 'pi pi-fw pi-comment',
                    path: '/apps/cms',
                    items: [
                       
                        {
                            label: 'Liste des véhicules',
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/apps/cms/detail2']
                        },
                        {
                            label: 'Livreurs',
                            icon: 'pi pi-fw pi-image',
                            routerLink: ['/apps/cms/list']
                        },
                        {
                            label: 'Prestataires',
                            icon: 'pi pi-fw pi-pencil',
                            routerLink: ['/apps/cms/edit']
                        }
                    ]
                },
            ]
        },
        {
            label: 'ADMINISTRATION',
            icon: 'pi pi-fw pi-briefcase',
            path: '/pages',
            items: [
                
                {
                    label: 'Paramètres',
                    icon: 'pi pi-fw pi-cog',
                    path: '/auth',
                    items: [
                        {
                            label: 'Générale',
                            icon: 'pi pi-fw pi-sign-in',
                            routerLink: ['/auth/login']
                        },
                        {
                            label: 'Profile',
                            icon: 'pi pi-fw pi-times-circle',
                            routerLink: ['/auth/error']
                        },
                        {
                            label: 'Organisations',
                            icon: 'pi pi-fw pi-lock',
                            routerLink: ['/auth/access']
                        },
                        {
                            label: 'Sites',
                            icon: 'pi pi-fw pi-user-plus',
                            routerLink: ['/auth/register']
                        },
                         
                    ]
                },
                
            ]
        },
         
    ];
}
