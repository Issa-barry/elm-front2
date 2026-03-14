import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { StyleClassModule } from 'primeng/styleclass';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

import { VehiculeService } from '@/services/vehicules/vehicule.service';
import { Vehicule, TYPE_VEHICULE_LABELS } from '@/models/vehicule.model';
import { PhoneFormatPipe } from '@/app/pipes/phone-format.pipe';
import { VehiculeCardMobile } from './vehicule-card-mobile/vehicule-card-mobile';
import { environment } from 'src/environments/environment';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-vehicule-liste',
  templateUrl: './vehicule-liste.html',
  styleUrl: './vehicule-liste.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PhoneFormatPipe,
    FormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MenuModule,
    RippleModule,
    SelectModule,
    StyleClassModule,
    SkeletonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    VehiculeCardMobile,
  ],
  providers: [MessageService],
})
export class VehiculeListe implements OnInit {
  private readonly apiOrigin = this.extractApiOrigin();
  searchQuery = signal<string>('');
  selectedFilter = signal<string>('all');
  vehicules = signal<Vehicule[]>([]);
  total = signal<number>(0);
  loading = false;

  filterOptions: FilterOption[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Actifs', value: 'actif' },
    { label: 'Inactifs', value: 'inactif' },
  ];

  mobileFilterMenuItems: MenuItem[] = [];

  constructor(
    private vehiculeService: VehiculeService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadVehicules();
    this.mobileFilterMenuItems = [
      { label: 'Tous', icon: 'pi pi-list', command: () => this.setSelectedFilter('all') },
      { label: 'Actifs', icon: 'pi pi-check-circle', command: () => this.setSelectedFilter('actif') },
      { label: 'Inactifs', icon: 'pi pi-times-circle', command: () => this.setSelectedFilter('inactif') },
    ];
  }

  loadVehicules(): void {
    this.loading = true;
    this.vehiculeService.getAll().subscribe({
      next: (resp) => {
        const mapped = (resp.data?.data ?? []).map((vehicule) => ({
          ...vehicule,
          photo_url: this.resolvePhotoUrl(vehicule),
        }));
        this.vehicules.set(mapped);
        this.total.set(resp.data?.total ?? 0);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.error?.message || 'Impossible de charger les véhicules.',
          life: 5000,
        });
      },
    });
  }

  filteredOrders = computed(() => {
    let filtered = this.vehicules();
    const selected = this.selectedFilter();

    if (selected !== 'all') {
      filtered = filtered.filter((v) => {
        const active = this.isVehiculeActive(v);
        return selected === 'actif' ? active : !active;
      });
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter((v) =>
        v.nom_vehicule.toLowerCase().includes(query) ||
        v.immatriculation.toLowerCase().includes(query) ||
        (v.marque ?? '').toLowerCase().includes(query) ||
        (v.modele ?? '').toLowerCase().includes(query),
      );
    }

    return filtered;
  });

  setSelectedFilter(value: string): void {
    if (value === 'all' || value === 'actif' || value === 'inactif') {
      this.selectedFilter.set(value);
    } else {
      this.selectedFilter.set('all');
    }
  }

  goEdit(v: Vehicule): void {
    this.router.navigate(['/vehicules/edit', v.id]);
  }

  goNew(): void {
    this.router.navigate(['/vehicules/new']);
  }

  goBack(): void {
    this.router.navigate(['/vehicules']);
  }

  onImageError(vehicule: Vehicule): void {
    if (!vehicule.photo_url) return;
    this.vehicules.update((list) =>
      list.map((item) => (item.id === vehicule.id ? { ...item, photo_url: null } : item)),
    );
  }

  toggleChevron(vehiculeId: number): void {
    const chevronElement = document.querySelector(`.chevron-icon-${vehiculeId}`);
    if (chevronElement) {
      chevronElement.classList.toggle('rotate-180');
    }
  }

  getInitials(name: string): string {
    const words = (name ?? '').split(' ').filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return (words[0]?.substring(0, 2) ?? '??').toUpperCase();
  }

  getTypeLabel(v: Vehicule): string {
    return TYPE_VEHICULE_LABELS[v.type_vehicule] ?? v.type_vehicule;
  }

  getStatusColor(v: Vehicule): string {
    return this.isVehiculeActive(v) ? 'green' : 'surface';
  }

  getStatusIcon(v: Vehicule): string {
    return this.isVehiculeActive(v) ? 'pi-check-circle' : 'pi-times-circle';
  }

  getStatusLabel(v: Vehicule): string {
    return this.isVehiculeActive(v) ? 'Actif' : 'Inactif';
  }

  getProprietaireNom(v: Vehicule): string {
    const p = v.proprietaire;
    if (!p) return '-';
    return `${p.prenom} ${p.nom}`.trim();
  }

  getLivreur(v: Vehicule) {
    return v.livreur_principal ?? v.livreurPrincipal ?? null;
  }

  getLivreurNom(v: Vehicule): string {
    const l = this.getLivreur(v);
    if (!l) return '-';
    return `${l.prenom} ${l.nom}`.trim();
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  private isVehiculeActive(v: Vehicule): boolean {
    const status = (v as { is_active: unknown }).is_active;
    return status === true || status === 1 || status === '1';
  }

  private resolvePhotoUrl(vehicule: Vehicule): string | null {
    const raw = (vehicule.photo_url ?? vehicule.photo_path ?? '').trim();
    if (!raw) return null;

    if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) {
      return raw;
    }

    if (raw.startsWith('//')) {
      const protocol = this.apiOrigin.startsWith('https://') ? 'https:' : 'http:';
      return `${protocol}${raw}`;
    }

    if (!this.apiOrigin) {
      return raw;
    }

    if (raw.startsWith('/')) {
      return `${this.apiOrigin}${raw}`;
    }

    return `${this.apiOrigin}/${raw}`;
  }

  private extractApiOrigin(): string {
    try {
      const url = new URL(environment.apiUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      return '';
    }
  }
}
