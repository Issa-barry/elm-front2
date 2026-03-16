import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

import { PhoneFormatPipe } from '@/app/pipes/phone-format.pipe';
import { Proprietaire } from '@/models/vehicule.model';
import { AuthService } from '@/services/auth/auth.service';
import { ProprietaireService } from '@/services/proprietaires/proprietaire.service';

type ProprietaireFilter = 'all' | 'actif' | 'inactif';
type StatusSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

interface ProprietaireRow extends Proprietaire {
  name: string;
  statusLabel: 'Actif' | 'Inactif';
}

@Component({
  selector: 'app-proprietaire-liste',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    SelectModule,
    ConfirmDialogModule,
    MenuModule,
    SkeletonModule,
    PhoneFormatPipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './proprietaire-liste.html',
  styleUrl: './proprietaire-liste.scss',
})
export class ProprietaireListe implements OnInit {
  @ViewChild('actionMenu') actionMenu!: Menu;

  proprietaires = signal<ProprietaireRow[]>([]);
  searchQuery = signal<string>('');
  selectedFilter = signal<ProprietaireFilter>('all');
  filterOptions: { label: string; value: ProprietaireFilter }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Actifs', value: 'actif' },
    { label: 'Inactifs', value: 'inactif' },
  ];
  loading = false;
  selectedProprietaires: ProprietaireRow[] = [];
  first = 0;
  rows = 8;
  selectedProprietaireId = signal<number | null>(null);
  isMobileView = false;
  private readonly mobileBreakpoint = 768;
  mobileFilterMenuItems: MenuItem[] = [];

  get canCreate(): boolean {
    return this.authService.hasPermission('proprietaires.create');
  }
  get canUpdate(): boolean {
    return this.authService.hasPermission('proprietaires.update');
  }
  get canDelete(): boolean {
    return this.authService.hasPermission('proprietaires.delete');
  }

  filteredProprietaires = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.proprietaires();
    if (!query) return list;
    return list.filter((proprietaire) => this.matchesSearch(proprietaire, query));
  });

  menuItems = computed<MenuItem[]>(() => {
    const proprietaireId = this.selectedProprietaireId();
    if (!proprietaireId) return [];

    const proprietaire = this.proprietaires().find((item) => item.id === proprietaireId);
    if (!proprietaire) return [];

    const items: MenuItem[] = [];

    if (this.canUpdate) {
      items.push({
        label: 'Modifier',
        icon: 'pi pi-pencil',
        command: () => this.goEdit(proprietaire),
      });
    }

    if (this.canDelete) {
      items.push({
        label: 'Supprimer',
        icon: 'pi pi-trash',
        command: () => this.deleteProprietaire(proprietaire),
      });
    }

    return items;
  });

  constructor(
    private proprietaireService: ProprietaireService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.syncMobileMode();
    this.buildMobileFilterMenuItems();
    this.load();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncMobileMode();
  }

  load(): void {
    this.loading = true;
    const filter = this.selectedFilter();
    const statut = filter === 'all' ? undefined : filter;

    this.proprietaireService.getAll(statut).subscribe({
      next: (resp) => {
        const rows = (resp.data?.data ?? []).map((proprietaire) => this.toRow(proprietaire));
        this.proprietaires.set(rows);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les proprietaires.',
          life: 5000,
        });
      },
    });
  }

  goNew(): void {
    this.router.navigate(['/vehicules/proprietaires/new']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  handleCardClick(proprietaire: ProprietaireRow): void {
    if (this.canUpdate) {
      this.goEdit(proprietaire);
    }
  }

  goEdit(proprietaire: ProprietaireRow): void {
    this.router.navigate(['/vehicules/proprietaires/edit', proprietaire.id]);
  }

  onFilterChange(value: ProprietaireFilter): void {
    this.selectedFilter.set(value);
    this.first = 0;
    this.load();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value ?? '');
    this.first = 0;
  }

  toggleMenu(event: Event, proprietaireId: number): void {
    this.selectedProprietaireId.set(proprietaireId);
    this.actionMenu.toggle(event);
  }

  deleteProprietaire(proprietaire: ProprietaireRow): void {
    this.confirmationService.confirm({
      message: `Supprimer ${proprietaire.prenom} ${proprietaire.nom} ?`,
      header: 'Supprimer le proprietaire',
      icon: 'pi pi-trash',
      rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Supprimer', severity: 'danger' },
      accept: () => {
        this.proprietaireService.delete(proprietaire.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Supprime',
              detail: `${proprietaire.prenom} ${proprietaire.nom} supprime.`,
              life: 3000,
            });
            this.proprietaires.update((list) => list.filter((x) => x.id !== proprietaire.id));
          },
          error: (err) =>
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.error?.message || 'Impossible de supprimer.',
              life: 5000,
            }),
        });
      },
    });
  }

  getInitials(name: string): string {
    const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '--';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  getStatusSeverity(status: 'Actif' | 'Inactif'): StatusSeverity {
    return status === 'Actif' ? 'success' : 'danger';
  }

  getAddressLabel(proprietaire: ProprietaireRow): string {
    const ville = proprietaire.ville ?? '';
    const quartier = proprietaire.quartier ?? '';
    const value = `${ville} ${quartier}`.trim();
    return value || '-';
  }

  private matchesSearch(proprietaire: ProprietaireRow, query: string): boolean {
    const searchable = [
      proprietaire.prenom,
      proprietaire.nom,
      proprietaire.phone,
      proprietaire.email,
      proprietaire.ville,
      proprietaire.quartier,
      proprietaire.pays,
      proprietaire.name,
      proprietaire.statusLabel,
      this.getAddressLabel(proprietaire),
    ]
      .filter((value) => !!value)
      .join(' ')
      .toLowerCase();

    return searchable.includes(query);
  }

  private toRow(proprietaire: Proprietaire): ProprietaireRow {
    const statusLabel = this.isProprietaireActive(proprietaire) ? 'Actif' : 'Inactif';
    return {
      ...proprietaire,
      name: `${proprietaire.prenom} ${proprietaire.nom}`.trim(),
      statusLabel,
    };
  }

  private isProprietaireActive(proprietaire: Proprietaire): boolean {
    const status = (proprietaire as { is_active: unknown }).is_active;
    return status === true || status === 1 || status === '1';
  }

  private syncMobileMode(): void {
    if (typeof window === 'undefined') {
      this.isMobileView = false;
      return;
    }

    this.isMobileView = window.innerWidth <= this.mobileBreakpoint;
  }

  private buildMobileFilterMenuItems(): void {
    this.mobileFilterMenuItems = [
      { label: 'Tous', icon: 'pi pi-filter-slash', command: () => this.onFilterChange('all') },
      { separator: true },
      { label: 'Actifs', command: () => this.onFilterChange('actif') },
      { label: 'Inactifs', command: () => this.onFilterChange('inactif') },
    ];
  }
}
