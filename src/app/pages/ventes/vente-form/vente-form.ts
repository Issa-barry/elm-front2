import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
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
  barcode?: string;
  qrCode?: string;
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
  imports: [CommonModule, FormsModule, ButtonModule, InputNumberModule, SelectModule, StyleClassModule],
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
      barcode: '100000000001|202603120001',
      qrCode: 'PACK30',
    },
    {
      id: 2,
      name: 'Pack de 20',
      variant: 'Eau minerale',
      price: 3500,
      stock: 85,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-2.jpg',
      category: 'pack',
      barcode: '100000000002',
      qrCode: 'PACK20',
    },
    {
      id: 3,
      name: 'Bouteille 1.5L',
      variant: 'Carton x6',
      price: 1200,
      stock: 240,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-3.jpg',
      category: 'boisson',
      barcode: '200000000001',
      qrCode: 'BTL15',
    },
    {
      id: 4,
      name: 'Bouteille 0.5L',
      variant: 'Carton x12',
      price: 900,
      stock: 300,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-4.jpg',
      category: 'boisson',
      barcode: '200000000002',
      qrCode: 'BTL05',
    },
    {
      id: 5,
      name: 'Bidon 10L',
      variant: 'Consigne incluse',
      price: 8000,
      stock: 50,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-1.jpg',
      category: 'pack',
      barcode: '300000000001',
      qrCode: 'BIDON10',
    },
    {
      id: 6,
      name: 'Distributeur',
      variant: 'Tabletop',
      price: 45000,
      stock: 15,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-2.jpg',
      category: 'accessoire',
      barcode: '400000000001',
      qrCode: 'DISP-TABLE',
    },
    {
      id: 7,
      name: 'Gobelets',
      variant: 'Pack x50',
      price: 1500,
      stock: 400,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-3.jpg',
      category: 'accessoire',
      barcode: '500000000001',
      qrCode: 'GOBELET50',
    },
    {
      id: 8,
      name: 'Bouchons',
      variant: 'Sachet x100',
      price: 700,
      stock: 600,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-4.jpg',
      category: 'accessoire',
      barcode: '500000000002',
      qrCode: 'BOUCHON100',
    },
    {
      id: 9,
      name: 'Pack de 10',
      variant: 'Eau minerale',
      price: 2000,
      stock: 180,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-1.jpg',
      category: 'pack',
      barcode: '100000000003',
      qrCode: 'PACK10',
    },
    {
      id: 10,
      name: 'Gallon 5L',
      variant: 'Carton x4',
      price: 3000,
      stock: 95,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-2.jpg',
      category: 'boisson',
      barcode: '200000000003',
      qrCode: 'GAL5',
    },
    {
      id: 11,
      name: 'Pompe manuelle',
      variant: 'Compatible bidons',
      price: 2500,
      stock: 60,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-3.jpg',
      category: 'accessoire',
      barcode: '400000000002',
      qrCode: 'POMPE',
    },
    {
      id: 12,
      name: 'Verres carton',
      variant: 'Pack x100',
      price: 1800,
      stock: 220,
      image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/shoppingcart/extended-slide-over-4.jpg',
      category: 'accessoire',
      barcode: '500000000003',
      qrCode: 'VERRE100',
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
    private userService: UserService,
    private router: Router
  ) {}

  showAddProduct = false;
  selectedProductId: number | null = null;

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

  get posProductOptions(): { label: string; value: number }[] {
    return this.posProducts.map((p) => ({
      label: [p.name, p.variant].filter(Boolean).join(' - '),
      value: p.id,
    }));
  }

  get hasCartItems(): boolean {
    return this.posCartItems.length > 0;
  }

  get isClientSale(): boolean {
    return this.saleType === 'client';
  }

  get isLivreurSale(): boolean {
    return this.saleType === 'livreur';
  }

  get isDeferredAllowed(): boolean {
    return this.saleType !== 'rapide';
  }

  get hasRequiredParty(): boolean {
    if (this.isClientSale) return this.selectedClientId != null;
    if (this.isLivreurSale) return this.selectedVehiculeId != null;
    return true;
  }

  get requiredPartyLabel(): string {
    if (this.isClientSale) return 'un client';
    if (this.isLivreurSale) return 'un véhicule';
    return '';
  }

  get canCheckout(): boolean {
    return this.hasCartItems && this.hasRequiredParty;
  }

  get canSaveLater(): boolean {
    return this.hasCartItems && this.isDeferredAllowed && this.hasRequiredParty;
  }

  get showPartyError(): boolean {
    return this.isDeferredAllowed && this.hasCartItems && !this.hasRequiredParty;
  }

  private scanBuffer = '';
  private scanTimeout: ReturnType<typeof setTimeout> | null = null;

  @HostListener('window:keydown', ['$event'])
  onScannerKeydown(event: KeyboardEvent): void {
    if (this.shouldIgnoreScan(event)) return;

    if (event.key === 'Enter') {
      const payload = this.scanBuffer.trim();
      if (payload.length > 0) {
        this.handleScan(payload);
      }
      this.scanBuffer = '';
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = null;
      }
      return;
    }

    if (event.key.length !== 1) return;

    this.scanBuffer += event.key;
    if (this.scanTimeout) clearTimeout(this.scanTimeout);
    this.scanTimeout = setTimeout(() => {
      this.scanBuffer = '';
      this.scanTimeout = null;
    }, 120);
  }

  private handleScan(raw: string): void {
    const code = raw.trim();
    if (!code) return;
    const candidates = this.buildScanCandidates(code);
    const product = this.posProducts.find((p) => this.matchesProductCode(p, candidates));
    if (product) {
      this.addToCart(product);
    }
  }

  private buildScanCandidates(code: string): Set<string> {
    const normalized = this.normalizeScanCode(code);
    const digitsOnly = normalized.replace(/[^0-9]/g, '');
    const set = new Set<string>();
    [code, code.replace(/\s+/g, ''), normalized, normalized.replace(/\s+/g, ''), digitsOnly].forEach((v) => {
      if (v) set.add(v);
    });
    return set;
  }

  private matchesProductCode(product: PosProduct, candidates: Set<string>): boolean {
    const barcodeSet = this.splitCodes(product.barcode);
    const qrSet = this.splitCodes(product.qrCode);
    for (const c of candidates) {
      if (barcodeSet.has(c) || qrSet.has(c) || String(product.id) === c) return true;
    }
    return false;
  }

  private splitCodes(value?: string): Set<string> {
    return new Set(
      (value ?? '')
        .split('|')
        .map((v) => v.trim())
        .filter(Boolean)
    );
  }

  private normalizeScanCode(code: string): string {
    const map: Record<string, string> = {
      '&': '1',
      '\u00e9': '2',
      '"': '3',
      "'": '4',
      '(': '5',
      '-': '6',
      '\u00e8': '7',
      '_': '8',
      '\u00e7': '9',
      '\u00e0': '0',
    };
    let out = '';
    for (const ch of code) {
      out += map[ch] ?? ch;
    }
    return out;
  }

  private shouldIgnoreScan(event: KeyboardEvent): boolean {
    if (event.altKey || event.ctrlKey || event.metaKey) return true;
    const target = event.target as HTMLElement | null;
    if (!target) return false;
    if (target.hasAttribute?.('data-scan-input')) return false;
    const tag = target.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
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

  updateCartQty(itemId: number, delta: number): void {
    const item = this.posCartItems.find((i) => i.id === itemId);
    if (!item) return;
    const next = item.qty + delta;
    if (next <= 0) {
      this.removeFromCart(itemId);
      return;
    }
    item.qty = next;
  }

  toggleAddProduct(): void {
    this.showAddProduct = !this.showAddProduct;
    if (!this.showAddProduct) {
      this.selectedProductId = null;
    }
  }

  addSelectedProduct(): void {
    if (this.selectedProductId == null) return;
    const product = this.posProducts.find((p) => p.id === this.selectedProductId);
    if (!product) return;
    this.addToCart(product);
    this.selectedProductId = null;
  }

  setCartQty(itemId: number, nextQty: number | null): void {
    if (nextQty == null) return;
    const item = this.posCartItems.find((i) => i.id === itemId);
    if (!item) return;
    if (nextQty <= 0) {
      this.removeFromCart(itemId);
      return;
    }
    item.qty = nextQty;
  }

  closePos(): void {
    this.router.navigate(['/ventes']);
  }

  checkout(): void {
    if (!this.canCheckout) return;
    // TODO: branch to payment flow / API integration
    console.log('Créer commande', {
      saleType: this.saleType,
      clientId: this.selectedClientId,
      vehiculeId: this.selectedVehiculeId,
      items: this.posCartItems,
    });
  }

  saveForLater(): void {
    if (!this.canSaveLater) return;
    // TODO: create sale in "non encaissé" state
    console.log('Enregistrer sans encaissement', {
      saleType: this.saleType,
      clientId: this.selectedClientId,
      vehiculeId: this.selectedVehiculeId,
      items: this.posCartItems,
    });
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
