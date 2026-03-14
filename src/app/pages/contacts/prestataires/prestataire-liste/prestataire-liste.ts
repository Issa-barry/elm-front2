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
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { PhoneFormatPipe } from '@/app/pipes/phone-format.pipe';
import { PRESTATAIRE_TYPES, Prestataire } from '@/models/prestataire.model';
import { AuthService } from '@/services/auth/auth.service';
import { PrestataireService } from '@/services/prestataire/prestataire.service';

type PrestataireFilter = 'all' | 'actif' | 'inactif';
type StatusSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

@Component({
  selector: 'app-prestataire-liste',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    TagModule,
    ConfirmDialogModule,
    MenuModule,
    PhoneFormatPipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './prestataire-liste.html',
  styleUrl: './prestataire-liste.scss',
})
export class PrestataireListe implements OnInit {
  @ViewChild('actionMenu') actionMenu!: Menu;

  prestataires = signal<Prestataire[]>([]);
  loading = false;
  searchQuery = signal('');
  selectedFilter = signal<PrestataireFilter>('all');
  selectedPrestataireId = signal<number | null>(null);
  selectedPrestataires: Prestataire[] = [];
  first = 0;
  rows = 10;

  readonly filterOptions: { label: string; value: PrestataireFilter }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Actifs', value: 'actif' },
    { label: 'Inactifs', value: 'inactif' },
  ];

  get canCreate(): boolean {
    return this.authService.hasPermission('prestataires.create');
  }
  get canUpdate(): boolean {
    return this.authService.hasPermission('prestataires.update');
  }
  get canDelete(): boolean {
    return this.authService.hasPermission('prestataires.delete');
  }

  filteredPrestataires = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.prestataires();
    }

    return this.prestataires().filter((prestataire) => this.matchesSearch(prestataire, query));
  });

  menuItems = computed<MenuItem[]>(() => {
    const id = this.selectedPrestataireId();
    if (!id) return [];

    const prestataire = this.prestataires().find((item) => item.id === id);
    if (!prestataire) return [];

    const items: MenuItem[] = [];

    if (this.canUpdate) {
      items.push({
        label: 'Modifier',
        icon: 'pi pi-pencil',
        command: () => this.goToEdit(prestataire),
      });
    }

    if (this.canUpdate) {
      items.push({
        label: prestataire.is_active ? 'Desactiver' : 'Activer',
        icon: 'pi pi-power-off',
        command: () => this.toggleStatus(prestataire),
      });
    }

    if (this.canDelete) {
      items.push({
        label: 'Supprimer',
        icon: 'pi pi-trash',
        command: () => this.deletePrestataire(prestataire),
      });
    }

    return items;
  });

  constructor(
    private prestataireService: PrestataireService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadPrestataires();
  }

  loadPrestataires(): void {
    this.loading = true;

    const filter = this.selectedFilter();
    const filters = filter === 'all' ? undefined : { is_active: filter === 'actif' };

    this.prestataireService.getPrestataires(filters).subscribe({
      next: (response) => {
        if (!response.success) {
          this.prestataires.set([]);
          this.loading = false;
          return;
        }

        const payload = response.data;
        const list = Array.isArray(payload) ? payload : (payload.data ?? []);
        this.prestataires.set(list);
        this.first = 0;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les prestataires',
          life: 5000,
        });
        this.loading = false;
      },
    });
  }

  onFilterChange(value: PrestataireFilter): void {
    this.selectedFilter.set(value);
    this.loadPrestataires();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value ?? '');
    this.first = 0;
  }

  navigateToCreate(): void {
    this.router.navigate(['/contacts/prestataires/new']);
  }

  goToEdit(prestataire: Prestataire): void {
    this.router.navigate(['/contacts/prestataires/edit', prestataire.id]);
  }

  toggleMenu(event: Event, prestataireId: number): void {
    this.selectedPrestataireId.set(prestataireId);
    this.actionMenu.toggle(event);
  }

  toggleStatus(prestataire: Prestataire): void {
    const action = prestataire.is_active ? 'desactiver' : 'activer';

    this.confirmationService.confirm({
      message: `Voulez-vous vraiment ${action} ce prestataire ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Confirmer' },
      accept: () => {
        this.prestataireService.togglePrestataireStatus(prestataire.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succes',
                detail: response.message || 'Statut mis a jour',
                life: 3000,
              });
              this.loadPrestataires();
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de changer le statut du prestataire',
              life: 5000,
            });
          },
        });
      },
    });
  }

  deletePrestataire(prestataire: Prestataire): void {
    this.confirmationService.confirm({
      message: 'Etes-vous sur de vouloir supprimer ce prestataire ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Supprimer', severity: 'danger' },
      accept: () => {
        this.prestataireService.deletePrestataire(prestataire.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succes',
                detail: 'Prestataire supprime avec succes',
                life: 3000,
              });
              this.loadPrestataires();
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: this.getApiErrorDetail(error, 'Impossible de supprimer le prestataire'),
              life: 5000,
            });
          },
        });
      },
    });
  }

  getInitials(nomComplet: string): string {
    if (!nomComplet) return '??';

    const parts = nomComplet.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return nomComplet.substring(0, 2).toUpperCase();
  }

  getTypeLabel(prestataire: Prestataire): string {
    if (prestataire.type_label) return prestataire.type_label;
    if (!prestataire.type) return '-';
    return PRESTATAIRE_TYPES.find((item) => item.value === prestataire.type)?.label ?? prestataire.type;
  }

  getAddressLabel(prestataire: Prestataire): string {
    if (prestataire.adresse && prestataire.adresse.trim()) {
      return prestataire.adresse;
    }

    const ville = prestataire.ville ?? '';
    const quartier = prestataire.quartier ?? '';
    const address = `${ville} ${quartier}`.trim();
    return address || '-';
  }

  getStatusLabel(prestataire: Prestataire): 'Actif' | 'Inactif' {
    return prestataire.is_active ? 'Actif' : 'Inactif';
  }

  getStatusSeverity(prestataire: Prestataire): StatusSeverity {
    return prestataire.is_active ? 'success' : 'danger';
  }

  private matchesSearch(prestataire: Prestataire, query: string): boolean {
    const searchable = [
      prestataire.nom_complet,
      prestataire.nom,
      prestataire.prenom,
      prestataire.phone,
      prestataire.email,
      prestataire.reference,
      prestataire.type_label,
      prestataire.type,
      prestataire.adresse,
      prestataire.ville,
      prestataire.quartier,
      prestataire.pays,
      this.getStatusLabel(prestataire),
    ]
      .filter((value) => !!value)
      .join(' ')
      .toLowerCase();

    return searchable.includes(query);
  }

  private getApiErrorDetail(error: unknown, fallback: string): string {
    const validationMessages = this.extractValidationMessages(error);
    if (validationMessages.length > 0) {
      return validationMessages.join('; ');
    }

    const apiMessage = this.extractApiMessage(error);
    if (apiMessage) {
      return apiMessage;
    }

    return fallback;
  }

  private extractApiMessage(error: unknown): string | null {
    const message = (error as { error?: { message?: unknown } })?.error?.message;
    if (typeof message !== 'string') {
      return null;
    }

    const trimmedMessage = message.trim();
    return trimmedMessage.length > 0 ? trimmedMessage : null;
  }

  private extractValidationMessages(error: unknown): string[] {
    const validationErrors = (error as { error?: { errors?: unknown } })?.error?.errors;
    if (!validationErrors || typeof validationErrors !== 'object') {
      return [];
    }

    return Object.values(validationErrors as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .map((message) => String(message).trim())
      .filter((message) => message.length > 0);
  }
}
