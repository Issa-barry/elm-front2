import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { StyleClassModule } from 'primeng/styleclass';

import { UserService } from '@/services/users/users.service';
import { VehiculeService } from '@/services/vehicules/vehicule.service';
import { Vehicule } from '@/models/vehicule.model';
import { User } from '@/models/user.model';

interface PosCategory {
  id: string;
  label: string;
}

interface PosProduct {
  id: number;
  name: string;
  variant: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

interface PosCartItem {
  id: number;
  name: string;
  variant: string;
  price: number;
  qty: number;
  image: string;
}

type SaleType = 'rapide' | 'client' | 'livreur';

@Component({
  selector: 'app-vente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, StyleClassModule],
  templateUrl: './vente-form.html',
  styleUrl: './vente-form.scss',
})
export class VenteForm implements OnInit {
  vehicules: Vehicule[] = [];
  vehiculeOptions: { label: string; value: number }[] = [];
  selectedVehiculeId: number | null = null;
  loadingVehicules = false;

  clients: User[] = [];
  clientOptions: { label: string; value: number }[] = [];
  selectedClientId: number | null = null;
  loadingClients = false;

  saleType: SaleType = 'rapide';
  searchQuery = '';
  selectedCategory = 'all';

  posCategories: PosCategory[] = [
    { id: 'all', label: 'Tous' },
    { id: 'pack', label: 'Packs' },
    { id: 'accessoire', label: 'Accessoires' },
    { id: 'boisson', label: 'Boissons' },
  ];

  posProducts: PosProduct[] = [
    {
      id: 1,
      name: 'Pack de 30',
      variant: 'Eau de source',
      price: 5000,
      stock: 120,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-1.jpg',
      category: 'pack',
    },
    {
      id: 2,
      name: 'Pack de 20',
      variant: 'Eau minerale',
      price: 3500,
      stock: 85,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-2.jpg',
      category: 'pack',
    },
    {
      id: 3,
      name: 'Bouteille 1.5L',
      variant: 'Carton x6',
      price: 1200,
      stock: 240,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-3.jpg',
      category: 'boisson',
    },
    {
      id: 4,
      name: 'Bouteille 0.5L',
      variant: 'Carton x12',
      price: 900,
      stock: 300,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-4.jpg',
      category: 'boisson',
    },
    {
      id: 5,
      name: 'Bidon 10L',
      variant: 'Consigne incluse',
      price: 8000,
      stock: 50,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-1.jpg',
      category: 'pack',
    },
    {
      id: 6,
      name: 'Distributeur',
      variant: 'Tabletop',
      price: 45000,
      stock: 15,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-2.jpg',
      category: 'accessoire',
    },
    {
      id: 7,
      name: 'Gobelets',
      variant: 'Pack x50',
      price: 1500,
      stock: 400,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-3.jpg',
      category: 'accessoire',
    },
    {
      id: 8,
      name: 'Bouchons',
      variant: 'Sachet x100',
      price: 700,
      stock: 600,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-4.jpg',
      category: 'accessoire',
    },
    {
      id: 9,
      name: 'Pack de 10',
      variant: 'Eau minerale',
      price: 2000,
      stock: 180,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-1.jpg',
      category: 'pack',
    },
    {
      id: 10,
      name: 'Gallon 5L',
      variant: 'Carton x4',
      price: 3000,
      stock: 95,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-2.jpg',
      category: 'boisson',
    },
    {
      id: 11,
      name: 'Pompe manuelle',
      variant: 'Compatible bidons',
      price: 2500,
      stock: 60,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-3.jpg',
      category: 'accessoire',
    },
    {
      id: 12,
      name: 'Verres carton',
      variant: 'Pack x100',
      price: 1800,
      stock: 220,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-4.jpg',
      category: 'accessoire',
    },
  ];

  posCartItems: PosCartItem[] = [
    {
      id: 1,
      name: 'Pack de 30',
      variant: 'Eau de source',
      price: 5000,
      qty: 1,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-1.jpg',
    },
    {
      id: 2,
      name: 'Bouteille 1.5L',
      variant: 'Carton x6',
      price: 1200,
      qty: 2,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-3.jpg',
    },
  ];

  constructor(
    private vehiculeService: VehiculeService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadVehicules();
    this.loadClients();
  }

  get selectedVehicule(): Vehicule | null {
    return this.vehicules.find((v) => v.id === this.selectedVehiculeId) ?? null;
  }

  get selectedVehiculeLabel(): string {
    const v = this.selectedVehicule;
    if (!v) return '-';
    const parts = [v.nom_vehicule, v.immatriculation].filter(Boolean);
    return parts.length ? parts.join(' - ') : '-';
  }

  get selectedLivreurLabel(): string {
    const v = this.selectedVehicule;
    if (!v) return '-';
    const livreur = v.livreurPrincipal ?? v.livreur_principal;
    if (!livreur) return '-';
    return `${livreur.prenom ?? ''} ${livreur.nom ?? ''}`.trim() || '-';
  }

  get selectedClientLabel(): string {
    const c = this.clients.find((u) => u.id === this.selectedClientId);
    if (!c) return '-';
    return `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() || '-';
  }


  get filteredProducts(): PosProduct[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.posProducts.filter((p) => {
      const matchesCategory = this.selectedCategory === 'all' || p.category === this.selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return `${p.name} ${p.variant}`.toLowerCase().includes(q);
    });
  }

  get posSubtotal(): number {
    return this.posCartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  get posTax(): number {
    return Math.round(this.posSubtotal * 0.03);
  }

  get posShipping(): number {
    return 0;
  }

  get posTotal(): number {
    return this.posSubtotal + this.posTax + this.posShipping;
  }

  addToCart(product: PosProduct): void {
    const existing = this.posCartItems.find((item) => item.id === product.id);
    if (existing) {
      existing.qty += 1;
      return;
    }
    this.posCartItems = [
      ...this.posCartItems,
      {
        id: product.id,
        name: product.name,
        variant: product.variant,
        price: product.price,
        qty: 1,
        image: product.image,
      },
    ];
  }

  removeFromCart(itemId: number): void {
    this.posCartItems = this.posCartItems.filter((item) => item.id !== itemId);
  }

  formatGnf(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value) + ' GNF';
  }

  private loadVehicules(): void {
    this.loadingVehicules = true;
    this.vehiculeService.getAll({ per_page: 200, statut: 'actif' }).subscribe({
      next: (resp) => {
        const raw = resp.data as any;
        const list: Vehicule[] = raw?.data ?? (Array.isArray(raw) ? raw : []);
        this.vehicules = list;
        this.vehiculeOptions = list.map((v) => ({
          label: `${v.nom_vehicule} - ${v.immatriculation}`,
          value: v.id,
        }));
        this.loadingVehicules = false;
      },
      error: () => {
        this.vehicules = [];
        this.vehiculeOptions = [];
        this.loadingVehicules = false;
      },
    });
  }

  private loadClients(): void {
    this.loadingClients = true;
    this.userService.getUsers({ per_page: 200, is_active: true }).subscribe({
      next: (resp) => {
        const raw: any = resp as any;
        const list: User[] = Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.data?.data)
            ? raw.data.data
            : [];
        this.clients = list.filter((u) => u.type === 'client' && u.is_active);
        this.clientOptions = this.clients.map((u) => ({
          label: `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || `Client ${u.id}`,
          value: u.id,
        }));
        this.loadingClients = false;
      },
      error: () => {
        this.clients = [];
        this.clientOptions = [];
        this.loadingClients = false;
      },
    });
  }

}
