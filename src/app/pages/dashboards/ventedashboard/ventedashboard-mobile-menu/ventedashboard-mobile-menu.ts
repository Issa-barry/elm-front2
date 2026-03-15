import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface MobileMenuItem {
  label: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-ventedashboard-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ventedashboard-mobile-menu.html',
  styleUrl: './ventedashboard-mobile-menu.scss',
  host: {
    '[style.display]': '"contents"'
  }
})
export class VentedashboardMobileMenu {
  private readonly router = inject(Router);

  readonly items: MobileMenuItem[] = [
    { label: 'Accueil', icon: 'pi pi-home', routerLink: '/' },
    { label: 'Packing', icon: 'pi pi-box', routerLink: '/packings' },
    { label: 'Prestataires', icon: 'pi pi-users', routerLink: '/contacts/prestataires' },
    { label: 'Utilisateurs', icon: 'pi pi-user', routerLink: '/contacts/utilisateurs' },
    { label: 'Vehicules', icon: 'pi pi-car', routerLink: '/vehicules' },
    { label: 'Livreurs', icon: 'pi pi-truck', routerLink: '/vehicules/livreurs' },
    { label: 'Proprietaires', icon: 'pi pi-id-card', routerLink: '/vehicules/proprietaires' },
    { label: 'Produits', icon: 'pi pi-barcode', routerLink: '/produits' },
  ];

  isActive(item: MobileMenuItem): boolean {
    const currentUrl = this.router.url;
    if (item.routerLink === '/') {
      return currentUrl === '/';
    }
    return currentUrl === item.routerLink || currentUrl.startsWith(`${item.routerLink}/`);
  }
}
