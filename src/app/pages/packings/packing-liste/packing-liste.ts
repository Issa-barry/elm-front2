import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, computed, signal } from '@angular/core';
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
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

import { PhoneFormatPipe } from '@/app/pipes/phone-format.pipe';
import { PACKING_STATUT_LABELS, PACKING_STATUT_SEVERITY, Packing, PackingStatut, PackingStatutSeverity } from '@/models/packing.model';
import { AuthService } from '@/services/auth/auth.service';
import { ApiResponse, PackingService, PaginatedResponse } from '@/services/packing/packing.service';

type PackingFilter = PackingStatut | 'all';

interface PackingRow extends Packing {
  prestataireNom: string;
  prestatairePhone: string;
}

@Component({
  selector: 'app-packing-liste',
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
    PhoneFormatPipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './packing-liste.html',
  styleUrl: './packing-liste.scss',
})
export class PackingListe implements OnInit {
  @ViewChild('actionMenu') actionMenu!: Menu;

  packings = signal<PackingRow[]>([]);
  searchQuery = signal<string>('');
  selectedStatut = signal<PackingFilter>('all');
  filterOptions: { label: string; value: PackingFilter }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Impayee', value: 'impayee' },
    { label: 'Partielle', value: 'partielle' },
    { label: 'Payee', value: 'payee' },
    { label: 'Annulee', value: 'annulee' },
  ];
  loading = false;
  first = 0;
  rows = 10;
  selectedPackingId = signal<number | null>(null);

  get canCreate(): boolean {
    return this.authService.hasPermission('packings.create');
  }
  get canRead(): boolean {
    return this.authService.hasPermission('packings.read') || this.canUpdate;
  }
  get canUpdate(): boolean {
    return this.authService.hasPermission('packings.update');
  }
  get canDelete(): boolean {
    return this.authService.hasPermission('packings.delete');
  }

  filteredPackings = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.packings();
    if (!query) return list;
    return list.filter((packing) => this.matchesSearch(packing, query));
  });

  menuItems = computed<MenuItem[]>(() => {
    const packingId = this.selectedPackingId();
    if (!packingId) return [];

    const packing = this.packings().find((item) => item.id === packingId);
    if (!packing) return [];

    const items: MenuItem[] = [];

    if (this.canRead) {
      items.push({
        label: 'Details',
        icon: 'pi pi-eye',
        command: () => this.goDetails(packing),
      });
    }

    if (this.canUpdate) {
      items.push({
        label: 'Modifier',
        icon: 'pi pi-pencil',
        command: () => this.goEdit(packing),
      });
    }

    if (this.canDelete) {
      items.push({
        label: 'Supprimer',
        icon: 'pi pi-trash',
        command: () => this.deletePacking(packing),
      });
    }

    return items;
  });

  constructor(
    private packingService: PackingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const statut = this.selectedStatut();
    const filters = statut === 'all' ? undefined : { statut };

    this.packingService.getPackings(filters).subscribe({
      next: (response) => {
        const rows = this.extractPackings(response).map((packing) => this.toRow(packing));
        this.packings.set(rows);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.getApiErrorDetail(error, 'Impossible de charger les packings.'),
          life: 5000,
        });
      },
    });
  }

  goNew(): void {
    this.router.navigate(['/packings/new']);
  }

  goEdit(packing: PackingRow): void {
    this.router.navigate(['/packings/edit', packing.id]);
  }

  goDetails(packing: PackingRow): void {
    this.router.navigate(['/packings/details', packing.id]);
  }

  onFilterChange(value: PackingFilter): void {
    this.selectedStatut.set(value);
    this.first = 0;
    this.load();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value ?? '');
    this.first = 0;
  }

  toggleMenu(event: Event, packingId: number): void {
    this.selectedPackingId.set(packingId);
    this.actionMenu.toggle(event);
  }

  deletePacking(packing: PackingRow): void {
    this.confirmationService.confirm({
      message: `Supprimer le packing ${packing.reference} ?`,
      header: 'Supprimer le packing',
      icon: 'pi pi-trash',
      rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Supprimer', severity: 'danger' },
      accept: () => {
        this.packingService.deletePacking(packing.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Supprime',
              detail: `Packing ${packing.reference} supprime.`,
              life: 3000,
            });
            this.packings.update((list) => list.filter((item) => item.id !== packing.id));
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: this.getApiErrorDetail(error, 'Impossible de supprimer.'),
              life: 5000,
            });
          },
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

  getStatutLabel(statut: PackingStatut): string {
    return PACKING_STATUT_LABELS[statut] || statut;
  }

  getStatutSeverity(statut: PackingStatut): PackingStatutSeverity {
    return PACKING_STATUT_SEVERITY[statut] || 'info';
  }

  formatDateDisplay(dateValue: string | Date): string {
    if (!dateValue) return '-';
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('fr-FR');
  }

  formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(value ?? 0)} GNF`;
  }

  private toRow(packing: Packing): PackingRow {
    const prestataireNom =
      packing.prestataire_nom ||
      `${packing.prestataire?.prenom ?? ''} ${packing.prestataire?.nom ?? ''}`.trim() ||
      '-';

    return {
      ...packing,
      prestataireNom,
      prestatairePhone: packing.prestataire?.phone ?? '',
    };
  }

  private matchesSearch(packing: PackingRow, query: string): boolean {
    const searchable = [
      packing.reference,
      packing.prestataireNom,
      packing.prestatairePhone,
      this.getStatutLabel(packing.statut),
      this.formatDateDisplay(packing.date),
      packing.nb_rouleaux?.toString(),
      packing.montant?.toString(),
      packing.montant_verse?.toString(),
      packing.montant_restant?.toString(),
    ]
      .filter((value) => !!value)
      .join(' ')
      .toLowerCase();

    const normalizedSearchable = searchable.replace(/\s+/g, '');
    const normalizedQuery = query.replace(/\s+/g, '');
    return searchable.includes(query) || normalizedSearchable.includes(normalizedQuery);
  }

  private extractPackings(response: ApiResponse<Packing[]> | PaginatedResponse<Packing>): Packing[] {
    const data = response.data;
    return Array.isArray(data) ? data : (data.data ?? []);
  }

  private getApiErrorDetail(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: unknown } })?.error?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message.trim();
    }
    return fallback;
  }
}
