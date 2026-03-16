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
import { User } from '@/models/user.model';
import { AuthService } from '@/services/auth/auth.service';
import { UsineService } from '@/services/usine/usine.service';
import { ApiResponse, PaginatedResponse, UserFilters, UserService } from '@/services/users/users.service';
import { UtilisateurFormDialog } from '../utilisateur-form-dialog/utilisateur-form-dialog';

type UtilisateurFilter = 'all' | 'actif' | 'inactif';
type StatusSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

interface UtilisateurRow extends User {
  name: string;
  statusLabel: 'Actif' | 'Inactif';
  roleLabel: string;
  siteLabel: string;
}

@Component({
  selector: 'app-utilisateur-liste',
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
    UtilisateurFormDialog,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './utilisateur-liste.html',
  styleUrl: './utilisateur-liste.scss',
})
export class UtilisateurListe implements OnInit {
  @ViewChild('actionMenu') actionMenu!: Menu;

  users = signal<UtilisateurRow[]>([]);
  searchQuery = signal<string>('');
  selectedFilter = signal<UtilisateurFilter>('all');
  filterOptions: { label: string; value: UtilisateurFilter }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Actifs', value: 'actif' },
    { label: 'Inactifs', value: 'inactif' },
  ];
  loading = false;
  selectedUsers: UtilisateurRow[] = [];
  first = 0;
  rows = 10;
  selectedUserId = signal<number | null>(null);
  viewDialogVisible = false;
  viewUserId: number | null = null;
  viewDialogMode: 'create' | 'edit' = 'edit';
  isMobileView = false;
  private readonly mobileBreakpoint = 768;
  mobileFilterMenuItems: MenuItem[] = [];
  private siteLabelById = new Map<number, string>();
  private siteHydrationRequested = new Set<number>();

  get canCreate(): boolean {
    return this.authService.hasPermission('users.create');
  }
  get canUpdate(): boolean {
    return this.authService.hasPermission('users.update');
  }
  get canDelete(): boolean {
    return this.authService.hasPermission('users.delete');
  }

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.users();
    if (!query) return list;
    return list.filter((user) => this.matchesSearch(user, query));
  });

  menuItems = computed<MenuItem[]>(() => {
    const userId = this.selectedUserId();
    if (!userId) return [];

    const user = this.users().find((item) => item.id === userId);
    if (!user) return [];

    const items: MenuItem[] = [];

    if (this.canUpdate) {
      items.push({
        label: 'Modifier',
        icon: 'pi pi-pencil',
        command: () => this.goEdit(user),
      });
      items.push({
        label: user.statusLabel === 'Actif' ? 'Desactiver' : 'Activer',
        icon: 'pi pi-power-off',
        command: () => this.toggleStatus(user),
      });
    }

    if (this.canDelete) {
      items.push({
        label: 'Supprimer',
        icon: 'pi pi-trash',
        command: () => this.deleteUser(user),
      });
    }

    return items;
  });

  constructor(
    private userService: UserService,
    private usineService: UsineService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.syncMobileMode();
    this.buildMobileFilterMenuItems();
    this.loadSites();
    this.load();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncMobileMode();
  }

  load(): void {
    this.loading = true;
    const filter = this.selectedFilter();
    const filters: UserFilters | undefined = filter === 'all' ? undefined : { is_active: filter === 'actif' };

    this.userService.getUsers(filters).subscribe({
      next: (response) => {
        const rows = this.extractUsers(response).map((user) => this.toRow(user));
        this.users.set(rows);
        this.loading = false;
        this.hydrateMissingSiteLabels(rows);
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les utilisateurs.',
          life: 5000,
        });
      },
    });
  }

  navigateToCreate(): void {
    if (!this.canCreate) return;
    this.viewDialogMode = 'create';
    this.viewUserId = null;
    this.viewDialogVisible = true;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  handleCardClick(user: UtilisateurRow): void {
    if (this.canUpdate) {
      this.goEdit(user);
    }
  }

  goEdit(user: UtilisateurRow): void {
    if (!this.canUpdate) return;
    this.viewDialogMode = 'edit';
    this.viewUserId = user.id;
    this.viewDialogVisible = true;
  }

  onDialogVisibleChange(visible: boolean): void {
    this.viewDialogVisible = visible;
    if (!visible) {
      this.viewUserId = null;
    }
  }

  onDialogUserSaved(event: { user: User; mode: 'create' | 'edit' }): void {
    this.load();
    this.messageService.add({
      severity: 'success',
      summary: 'Succes',
      detail: event.mode === 'create' ? 'Utilisateur cree avec succes.' : 'Utilisateur modifie avec succes.',
      life: 3000,
    });
  }

  onFilterChange(value: UtilisateurFilter): void {
    this.selectedFilter.set(value);
    this.first = 0;
    this.load();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value ?? '');
    this.first = 0;
  }

  toggleMenu(event: Event, userId: number): void {
    this.selectedUserId.set(userId);
    this.actionMenu.toggle(event);
  }

  deleteUser(user: UtilisateurRow): void {
    this.confirmationService.confirm({
      message: `Supprimer ${user.name} ?`,
      header: "Supprimer l'utilisateur",
      icon: 'pi pi-trash',
      rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Supprimer', severity: 'danger' },
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Supprime',
              detail: `${user.name} supprime.`,
              life: 3000,
            });
            this.users.update((list) => list.filter((item) => item.id !== user.id));
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

  toggleStatus(user: UtilisateurRow): void {
    const action = user.statusLabel === 'Actif' ? 'desactiver' : 'activer';

    this.confirmationService.confirm({
      message: `Voulez-vous vraiment ${action} cet utilisateur ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Confirmer' },
      accept: () => {
        this.userService.toggleUserStatus(user.id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succes',
              detail: response.message || 'Statut mis a jour.',
              life: 3000,
            });
            this.load();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.error?.message || 'Impossible de changer le statut.',
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

  getStatusSeverity(status: 'Actif' | 'Inactif'): StatusSeverity {
    return status === 'Actif' ? 'success' : 'danger';
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

  private matchesSearch(user: UtilisateurRow, query: string): boolean {
    const searchable = [
      user.prenom,
      user.nom,
      user.nom_complet,
      user.name,
      user.phone,
      user.email,
      user.roleLabel,
      user.siteLabel,
      user.ville,
      user.quartier,
      user.pays,
      user.statusLabel,
    ]
      .filter((value) => !!value)
      .join(' ')
      .toLowerCase();

    const normalizedSearchable = searchable.replace(/\s+/g, '');
    const normalizedQuery = query.replace(/\s+/g, '');
    return searchable.includes(query) || normalizedSearchable.includes(normalizedQuery);
  }

  private toRow(user: User): UtilisateurRow {
    return {
      ...user,
      name: user.nom_complet || `${user.prenom} ${user.nom}`.trim(),
      statusLabel: this.isUserActive(user) ? 'Actif' : 'Inactif',
      roleLabel: this.resolveRoleLabel(user),
      siteLabel: this.resolveSiteLabel(user),
    };
  }

  private isUserActive(user: User): boolean {
    const status = (user as { is_active: unknown }).is_active;
    return status === true || status === 1 || status === '1';
  }

  private extractUsers(response: ApiResponse<User[]> | PaginatedResponse<User>): User[] {
    const data = response.data;
    return Array.isArray(data) ? data : (data.data ?? []);
  }

  private resolveRoleLabel(user: User): string {
    const raw = user as User & {
      role?: unknown;
      role_name?: unknown;
      role_label?: unknown;
      roles?: unknown;
      role_names?: unknown;
    };

    const roleNames = this.toStringArray(raw.role_names);
    if (roleNames.length > 0) return roleNames.join(', ');

    const roles = this.toStringArray(raw.roles);
    if (roles.length > 0) return roles.join(', ');

    return (
      this.toStringValue(raw.role_label) ??
      this.toStringValue(raw.role_name) ??
      this.toStringValue(raw.role) ??
      '-'
    );
  }

  private resolveSiteLabel(user: User): string {
    const raw = user as unknown as Record<string, unknown>;

    const directKeys = [
      'site_label',
      'site_name',
      'site_nom',
      'nom_site',
      'usine_label',
      'usine_name',
      'usine_nom',
      'site',
      'usine',
    ];

    for (const key of directKeys) {
      const label = this.extractSiteName(raw[key]);
      if (label) return label;
    }

    const nestedKeys = ['current_site', 'current_usine', 'default_site', 'default_usine'];
    for (const key of nestedKeys) {
      const label = this.extractSiteName(raw[key]);
      if (label) return label;
    }

    const listKeys = ['sites', 'usines', 'accessible_sites', 'accessible_usines'];
    for (const key of listKeys) {
      const value = raw[key];
      if (!Array.isArray(value) || value.length === 0) continue;
      const preferredSite = value.find((entry) => this.isDefaultSiteEntry(entry)) ?? value[0];
      const firstSite = this.extractSiteName(preferredSite);
      if (firstSite) return firstSite;

      const firstSiteId = this.extractSiteId(preferredSite);
      if (firstSiteId !== null) {
        const labelFromMap = this.siteLabelById.get(firstSiteId);
        if (labelFromMap) return labelFromMap;
      }
    }

    const directSiteId = this.resolveSiteId(raw);
    if (directSiteId !== null) {
      const labelFromMap = this.siteLabelById.get(directSiteId);
      if (labelFromMap) return labelFromMap;
    }

    return '-';
  }

  private resolveSiteId(raw: Record<string, unknown>): number | null {
    return (
      this.toNumberOrNull(raw['site_id']) ??
      this.toNumberOrNull(raw['usine_id']) ??
      this.toNumberOrNull(raw['default_site_id']) ??
      this.toNumberOrNull(raw['default_usine_id']) ??
      this.toNumberOrNull(raw['current_site_id']) ??
      this.toNumberOrNull(raw['current_usine_id']) ??
      this.extractSiteId(raw['site']) ??
      this.extractSiteId(raw['usine']) ??
      this.extractSiteId(raw['default_site']) ??
      this.extractSiteId(raw['default_usine']) ??
      this.extractSiteId(raw['current_site']) ??
      this.extractSiteId(raw['current_usine'])
    );
  }

  private extractSiteName(value: unknown): string | null {
    if (typeof value === 'string') {
      return this.toStringValue(value);
    }

    if (!value || typeof value !== 'object') {
      return null;
    }

    const site = value as Record<string, unknown>;
    const keys = ['nom', 'name', 'label', 'site_name', 'site_nom', 'usine_name', 'usine_nom'];

    for (const key of keys) {
      const label = this.toStringValue(site[key]);
      if (label) return label;
    }

    return null;
  }

  private extractSiteId(value: unknown): number | null {
    if (!value || typeof value !== 'object') return null;
    const site = value as Record<string, unknown>;
    return (
      this.toNumberOrNull(site['id']) ??
      this.toNumberOrNull(site['site_id']) ??
      this.toNumberOrNull(site['usine_id'])
    );
  }

  private isDefaultSiteEntry(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    const raw = value as Record<string, unknown>;

    if (raw['is_default'] === true || raw['default'] === true) return true;

    const pivot = raw['pivot'];
    if (!pivot || typeof pivot !== 'object') return false;
    const rawPivot = pivot as Record<string, unknown>;
    return rawPivot['is_default'] === true || rawPivot['default'] === true;
  }

  private toNumberOrNull(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private loadSites(): void {
    this.usineService.getAll().subscribe({
      next: (response) => {
        const rows = this.extractSiteRows(response);
        this.siteLabelById = new Map(
          rows
            .map((site) => {
              const id = this.toNumberOrNull((site as Record<string, unknown>)['id']);
              const label = this.toStringValue((site as Record<string, unknown>)['nom'] ?? (site as Record<string, unknown>)['name']);
              return id !== null && label ? [id, label] as const : null;
            })
            .filter((entry): entry is readonly [number, string] => entry !== null),
        );
        this.refreshSiteLabelsFromMap();
      },
      error: () => {
        this.siteLabelById = new Map<number, string>();
      },
    });
  }

  private refreshSiteLabelsFromMap(): void {
    if (this.users().length === 0 || this.siteLabelById.size === 0) return;
    this.users.update((list) =>
      list.map((user) => ({
        ...user,
        siteLabel: this.resolveSiteLabel(user),
      })),
    );
  }

  private extractSiteRows(response: unknown): Record<string, unknown>[] {
    const data = (response as { data?: unknown })?.data;
    if (Array.isArray(data)) return data as Record<string, unknown>[];

    const nestedData = (data as { data?: unknown })?.data;
    if (Array.isArray(nestedData)) return nestedData as Record<string, unknown>[];

    return [];
  }

  private hydrateMissingSiteLabels(rows: UtilisateurRow[]): void {
    const candidates = rows
      .filter((row) => row.siteLabel === '-')
      .filter((row) => !this.siteHydrationRequested.has(row.id))
      .slice(0, 5);

    if (candidates.length === 0) return;

    candidates.forEach((row) => this.siteHydrationRequested.add(row.id));
    this.hydrateSiteLabelsSequentially(candidates, 0);
  }

  private hydrateSiteLabelsSequentially(candidates: UtilisateurRow[], index: number): void {
    if (index >= candidates.length) return;

    const row = candidates[index];
    this.userService.getUser(row.id).subscribe({
      next: (response) => {
        const label = this.resolveSiteLabel(response.data);
        if (!label || label === '-') return;

        this.users.update((list) =>
          list.map((user) => (user.id === row.id ? { ...user, siteLabel: label } : user)),
        );
      },
      error: () => {
        // Ignore ponctual hydration errors to keep UI reactive.
        this.hydrateSiteLabelsSequentially(candidates, index + 1);
      },
      complete: () => {
        this.hydrateSiteLabelsSequentially(candidates, index + 1);
      },
    });
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => this.toStringValue(item)).filter((item): item is string => item !== null);
  }

  private toStringValue(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
 
