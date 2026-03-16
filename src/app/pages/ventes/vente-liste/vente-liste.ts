import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
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
import { AuthService } from '@/services/auth/auth.service';
import { CommandeVenteService } from '@/services/ventes/commande-vente.service';
import { CommandeVente, STATUT_FACTURE_LABELS, STATUT_FACTURE_SEVERITY, StatutFacture } from '@/models/vente.model';

type VenteFilter = 'all' | StatutFacture | 'cloturee';
type StatusSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

@Component({
  selector: 'app-vente-liste',
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
    MenuModule,
    DialogModule,
    SkeletonModule,
    PhoneFormatPipe,
  ],
  providers: [MessageService],
  templateUrl: './vente-liste.html',
  styleUrl: './vente-liste.scss',
})
export class VenteListe implements OnInit {
  @ViewChild('actionMenu') actionMenu!: Menu;

  commandes = signal<CommandeVente[]>([]);
  searchQuery = signal('');
  selectedFilter = signal<VenteFilter>('all');
  filterOptions: { label: string; value: VenteFilter }[] = [
    { label: 'Toutes', value: 'all' },
    { label: 'Impayées', value: 'impayee' },
    { label: 'Partielles', value: 'partiel' },
    { label: 'Payées', value: 'payee' },
    { label: 'Annulées', value: 'annulee' },
    { label: 'Clôturées', value: 'cloturee' },
  ];

  loading = false;
  first = 0;
  rows = 10;
  selectedCommandes: CommandeVente[] = [];
  selectedCommandeId = signal<number | null>(null);
  isMobileView = false;
  private readonly mobileBreakpoint = 768;
  mobileFilterMenuItems: MenuItem[] = [];

  annulationDialogVisible = false;
  annulationLoading = false;
  commandeToAnnuler: CommandeVente | null = null;
  motifAnnulation = '';

  get canCreate(): boolean {
    return this.authService.hasPermission('commandes.create');
  }
  get canUpdate(): boolean {
    return this.authService.hasPermission('commandes.update');
  }
  get canDelete(): boolean {
    return this.authService.hasPermission('commandes.delete');
  }
  get canRead(): boolean {
    return this.authService.hasPermission('commandes.read') || this.canUpdate;
  }

  filteredCommandes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.selectedFilter();
    let list = this.commandes();

    if (filter !== 'all') {
      if (filter === 'cloturee') {
        list = list.filter((c) => c.statut === 'cloturee');
      } else {
        list = list.filter((c) => c.facture?.statut_facture === filter);
      }
    }

    if (!query) {
      return list;
    }

    return list.filter((commande) => this.matchesSearch(commande, query));
  });

  menuItems = computed<MenuItem[]>(() => {
    const commandeId = this.selectedCommandeId();
    if (!commandeId) return [];

    const commande = this.commandes().find((item) => item.id === commandeId);
    if (!commande) return [];

    const items: MenuItem[] = [];

    if (this.canRead) {
      items.push({
        label: 'Details',
        icon: 'pi pi-eye',
        command: () => this.goDetails(commande),
      });
    }

    if (this.canUpdate) {
      items.push({
        label: 'Modifier',
        icon: 'pi pi-pencil',
        disabled: this.isLocked(commande),
        command: () => this.goEdit(commande),
      });
    }

    if (this.canDelete) {
      items.push({
        label: 'Annuler',
        icon: 'pi pi-ban',
        disabled: this.isLocked(commande),
        command: () => this.openAnnulationDialog(commande),
      });
    }

    return items;
  });

  constructor(
    private commandeService: CommandeVenteService,
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.syncMobileMode();
    this.buildMobileFilterMenuItems();
    this.loadCommandes();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncMobileMode();
  }

  loadCommandes(): void {
    this.loading = true;

    this.commandeService.getCommandes().subscribe({
      next: (resp) => {
        const payload = resp.data;
        const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
        this.commandes.set(list);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.getApiErrorDetail(error, 'Impossible de charger les ventes.'),
          life: 5000,
        });
      },
    });
  }

  onFilterChange(value: VenteFilter): void {
    this.selectedFilter.set(value);
    this.first = 0;
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value ?? '');
    this.first = 0;
  }

  goNew(): void {
    this.router.navigate(['/ventes/new']);
  }

  goEdit(commande: CommandeVente): void {
    this.router.navigate(['/ventes/edit', commande.id]);
  }

  goDetails(commande: CommandeVente): void {
    this.router.navigate(['/ventes/details', commande.id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  toggleMenu(event: Event, commandeId: number): void {
    this.selectedCommandeId.set(commandeId);
    this.actionMenu.toggle(event);
  }

  openAnnulationDialog(commande: CommandeVente): void {
    this.commandeToAnnuler = commande;
    this.motifAnnulation = '';
    this.annulationDialogVisible = true;
  }

  confirmerAnnulation(): void {
    if (!this.commandeToAnnuler || this.annulationLoading || !this.motifAnnulation.trim()) {
      return;
    }

    this.annulationLoading = true;
    this.commandeService
      .annulerCommande(this.commandeToAnnuler.id, { motif_annulation: this.motifAnnulation.trim() })
      .subscribe({
        next: () => {
          this.annulationLoading = false;
          this.annulationDialogVisible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Commande annulée',
            detail: 'La commande a été annulée avec succès.',
            life: 4000,
          });
          this.loadCommandes();
        },
        error: (error) => {
          this.annulationLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: this.getApiErrorDetail(error, "Impossible d'annuler la commande."),
            life: 5000,
          });
        },
      });
  }

  isAnnulee(commande: CommandeVente): boolean {
    return commande.statut === 'annulee';
  }

  isCloturee(commande: CommandeVente): boolean {
    return commande.statut === 'cloturee';
  }

  isLocked(commande: CommandeVente): boolean {
    return this.isAnnulee(commande) || this.isCloturee(commande) || (commande.facture?.montant_encaisse ?? 0) > 0;
  }

  getStatutLabel(statut: StatutFacture | undefined): string {
    if (!statut) return '-';
    return STATUT_FACTURE_LABELS[statut] ?? statut;
  }

  getStatutSeverity(statut: StatutFacture | undefined): StatusSeverity {
    if (!statut) return 'secondary';
    return STATUT_FACTURE_SEVERITY[statut] ?? 'secondary';
  }

  getLivreurName(commande: CommandeVente): string {
    const livreur = commande.vehicule?.livreurPrincipal ?? commande.vehicule?.livreur_principal;
    if (!livreur) return '-';
    const fullName = [livreur.prenom, livreur.nom].filter(Boolean).join(' ').trim();
    return fullName || '-';
  }

  getLivreurPhone(commande: CommandeVente): string {
    const livreur = commande.vehicule?.livreurPrincipal ?? commande.vehicule?.livreur_principal;
    return livreur?.phone ?? '';
  }

  formatMontant(value: string | number | null | undefined): string {
    if (value == null || value === '') return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(num)) return '-';
    return `${new Intl.NumberFormat('fr-FR').format(num)} GNF`;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('fr-FR');
  }

  private matchesSearch(commande: CommandeVente, query: string): boolean {
    const livreur = this.getLivreurName(commande);
    const searchable = [
      commande.reference,
      commande.vehicule?.nom_vehicule,
      commande.vehicule?.immatriculation,
      livreur,
      this.getStatutLabel(commande.facture?.statut_facture),
      this.formatMontant(commande.total_commande),
      this.formatDate(commande.created_at),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const normalizedSearchable = searchable.replace(/\s+/g, '');
    const normalizedQuery = query.replace(/\s+/g, '');
    return searchable.includes(query) || normalizedSearchable.includes(normalizedQuery);
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
      { label: 'Toutes', icon: 'pi pi-filter-slash', command: () => this.onFilterChange('all') },
      { separator: true },
      { label: 'Impayées', command: () => this.onFilterChange('impayee') },
      { label: 'Partielles', command: () => this.onFilterChange('partiel') },
      { label: 'Payées', command: () => this.onFilterChange('payee') },
      { label: 'Annulées', command: () => this.onFilterChange('annulee') },
      { label: 'Clôturées', command: () => this.onFilterChange('cloturee') },
    ];
  }

  private getApiErrorDetail(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: unknown } })?.error?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message.trim();
    }
    return fallback;
  }
}
