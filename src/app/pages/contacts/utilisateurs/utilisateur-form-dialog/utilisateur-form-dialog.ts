import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { timeout } from 'rxjs';

import { COUNTRIES } from '@/models/country.model';
import { Organisation } from '@/models/organisation.model';
import { CIVILITE_LABELS, Civilite, CreateUserDto, User, UserType } from '@/models/user.model';
import { Usine } from '@/models/usine.model';
import { OrganisationService } from '@/services/organisations/organisation.service';
import { RoleService } from '@/services/role/role.service';
import { UsineContextService } from '@/services/usine/usine-context.service';
import { UsineService } from '@/services/usine/usine.service';
import { UpdateUserDto, UserService } from '@/services/users/users.service';

type DialogMode = 'create' | 'edit';

type RoleOption = {
  label: string;
  value: string;
};

type SimpleOption = {
  label: string;
  value: number;
};

type UserDialogResult = {
  user: User;
  mode: DialogMode;
};

type UserDialogForm = {
  nom: string;
  prenom: string;
  phone: string;
  email: string;
  organisation_id: number | null;
  site_id: number | null;
  code_pays: string;
  pays: string;
  ville: string;
  quartier: string;
  type: UserType;
  role: string;
  civilite: Civilite | null;
  date_naissance: string | null;
  password: string;
  password_confirmation: string;
};

type ApiValidationErrorShape = {
  error?: {
    message?: unknown;
    errors?: Record<string, unknown>;
  };
};

@Component({
  selector: 'app-utilisateur-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, PasswordModule, SelectModule],
  templateUrl: './utilisateur-form-dialog.html',
  styleUrl: './utilisateur-form-dialog.scss',
})
export class UtilisateurFormDialog implements OnInit, OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() mode: DialogMode = 'edit';
  @Input() userId: number | null = null;
  @Output() userSaved = new EventEmitter<UserDialogResult>();

  loading = false;
  saving = false;
  submitted = false;
  formError: string | null = null;
  formErrors: string[] = [];
  phonePrefixError: string | null = null;
  loadedUser: User | null = null;

  readonly countries = COUNTRIES;
  readonly userTypeOptions: { label: string; value: UserType }[] = [
    { label: 'Staff', value: 'staff' },
    { label: 'Client', value: 'client' },
    { label: 'Prestataire', value: 'prestataire' },
    { label: 'Investisseur', value: 'investisseur' },
  ];
  readonly civiliteOptions: { label: string; value: Civilite }[] = (
    Object.entries(CIVILITE_LABELS) as [Civilite, string][]
  ).map(([value, label]) => ({ label, value }));
  private readonly staffRoles = ['admin_entreprise', 'manager', 'comptable', 'agent_vente', 'employe'];

  availableRoles: RoleOption[] = [];
  organisationOptions: SimpleOption[] = [];
  siteOptions: SimpleOption[] = [];
  private allSites: Usine[] = [];
  private pendingSiteLabel: string | null = null;
  private rolesLoaded = false;

  model: UserDialogForm = this.getDefaultModel();

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private organisationService: OrganisationService,
    private usineContext: UsineContextService,
    private usineService: UsineService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadOrganisations();
    this.loadSites();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true) {
      this.openDialog();
    }
  }

  get dialogHeader(): string {
    if (this.mode === 'create') return 'Nouvel utilisateur';
    return this.loadedUser?.reference
      ? `Modifier utilisateur ${this.loadedUser.reference}`
      : 'Modifier utilisateur';
  }

  get isStaffType(): boolean {
    return this.model.type === 'staff';
  }

  get roleOptions(): RoleOption[] {
    if (!this.isStaffType) {
      return this.model.type
        ? [{ label: this.capitalize(this.model.type), value: this.model.type }]
        : [];
    }

    const staffRoles = this.availableRoles.filter((role) => this.staffRoles.includes(role.value));
    const hasSelectedRole = !!this.model.role && staffRoles.some((role) => role.value === this.model.role);

    if (!hasSelectedRole && this.model.role) {
      return [
        ...staffRoles,
        {
          label: this.capitalize(this.model.role).replace(/_/g, ' '),
          value: this.model.role,
        },
      ];
    }

    return staffRoles;
  }

  get additionalFormErrors(): string[] {
    if (this.formErrors.length === 0) return [];
    if (this.formError && this.formErrors[0] === this.formError) {
      return this.formErrors.slice(1);
    }
    return this.formErrors;
  }

  onVisibleChange(nextVisible: boolean): void {
    if (!nextVisible) {
      this.resetState();
    }
    this.visibleChange.emit(nextVisible);
  }

  onDialogShow(): void {
    if (this.mode !== 'create') return;
    this.clearCreateSensitiveFields();
    setTimeout(() => this.clearCreateSensitiveFields(), 0);
  }

  onTypeChange(): void {
    if (this.model.type !== 'staff') {
      this.model.role = this.model.type;
      return;
    }

    if (this.model.role) {
      return;
    }

    this.model.role = this.getFirstStaffRoleValue();
  }

  onCountryChange(): void {
    this.model.pays = this.getCountryName(this.model.code_pays);
    if (this.model.phone.trim()) {
      this.validatePhonePrefixAndNormalize();
    }
  }

  onOrganisationChange(): void {
    this.refreshSiteOptions();
  }

  onSiteChange(): void {
    this.pendingSiteLabel = null;
    if (this.model.organisation_id) return;
    const selectedSite = this.allSites.find((site) => site.id === this.model.site_id);
    const selectedOrganisationId = selectedSite ? this.resolveSiteOrganisationId(selectedSite) : null;
    if (!selectedOrganisationId) return;
    this.model.organisation_id = selectedOrganisationId;
    this.refreshSiteOptions();
  }

  onPhoneBlur(): void {
    if (!this.model.phone.trim()) {
      this.phonePrefixError = null;
      return;
    }

    this.validatePhonePrefixAndNormalize();
  }

  save(): void {
    this.submitted = true;
    this.setFormError(null);

    if (!this.isFormValid()) {
      return;
    }

    if (this.mode === 'create') {
      this.createUser();
      return;
    }

    this.updateUser();
  }

  close(): void {
    this.resetState();
    this.visibleChange.emit(false);
  }

  private openDialog(): void {
    this.submitted = false;
    this.setFormError(null);
    this.model = this.getDefaultModel();
    this.loadedUser = null;
    this.pendingSiteLabel = null;

    this.loadRoles();

    if (this.mode === 'edit' && this.userId) {
      this.loadUser(this.userId);
      return;
    }

    const currentSiteId = this.usineContext.currentUsineId();
    this.model.site_id = currentSiteId;
    this.refreshSiteOptions();
    this.applyCreateDefaults();
    this.loading = false;
  }

  private loadRoles(): void {
    if (this.rolesLoaded) return;

    this.roleService.getRoles().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableRoles = response.data.map((roleData) => ({
            label: this.capitalize(roleData.role.name).replace(/_/g, ' '),
            value: roleData.role.name,
          }));
        }
        this.rolesLoaded = true;
        this.applyCreateDefaults();
      },
      error: () => {
        this.availableRoles = [
          { label: 'Admin Entreprise', value: 'admin_entreprise' },
          { label: 'Manager', value: 'manager' },
          { label: 'Comptable', value: 'comptable' },
          { label: 'Agent vente', value: 'agent_vente' },
          { label: 'Employe', value: 'employe' },
        ];
        this.rolesLoaded = true;
        this.applyCreateDefaults();
      },
    });
  }

  private loadUser(id: number): void {
    this.loading = true;
    this.userService.getUser(id).pipe(
      timeout(15000),
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.loadedUser = response.data;
          this.pendingSiteLabel = this.resolveUserSiteLabel(response.data);
          this.model = {
            nom: response.data.nom ?? '',
            prenom: response.data.prenom ?? '',
            phone: this.toLocalPhone(response.data.phone ?? '', response.data.code_pays || 'GN'),
            email: response.data.email ?? '',
            organisation_id: this.resolveUserOrganisationId(response.data),
            site_id: this.resolveUserSiteId(response.data),
            code_pays: response.data.code_pays || 'GN',
            pays: response.data.pays || this.getCountryName(response.data.code_pays || 'GN'),
            ville: response.data.ville ?? '',
            quartier: response.data.quartier ?? '',
            type: response.data.type ?? 'staff',
            role: this.resolveUserRole(response.data),
            civilite: response.data.civilite ?? null,
            date_naissance: response.data.date_naissance ?? null,
            password: '',
            password_confirmation: '',
          };
          this.refreshSiteOptions();
          this.onTypeChange();
        } else {
          this.setFormError('Impossible de charger cet utilisateur.');
        }
        this.loading = false;
      },
      error: (error) => {
        this.setApiError(error, "Erreur lors du chargement de l'utilisateur.");
        this.loading = false;
      },
    });
  }

  private createUser(): void {
    const siteId = this.model.site_id ?? this.usineContext.currentUsineId();
    if (siteId === null) {
      this.setFormError('Veuillez selectionner un site avant de creer un utilisateur.');
      return;
    }

    this.saving = true;

    const password = this.model.password;
    const passwordConfirmation = this.model.password;

    const payload: CreateUserDto = {
      nom: this.model.nom.trim(),
      prenom: this.model.prenom.trim(),
      phone: this.normalizePhoneForApi(this.model.phone, this.model.code_pays),
      email: this.model.email.trim() || undefined,
      pays: this.model.pays,
      code_pays: this.model.code_pays,
      code_phone_pays: this.getCodePhonePays(this.model.code_pays),
      ville: this.model.ville.trim(),
      quartier: this.model.quartier.trim(),
      password,
      password_confirmation: passwordConfirmation,
      type: this.model.type,
      role: this.model.role,
      civilite: this.model.civilite ?? undefined,
      date_naissance: this.model.date_naissance || undefined,
    };

    this.userService.createUserViaApi(payload).subscribe({
      next: (response) => {
        if (!response.success || !response.data?.id) {
          this.setFormError(response.message || 'Creation impossible.');
          this.saving = false;
          return;
        }

        const user = response.data;
        const usineRole = (payload.role === 'admin_entreprise' || payload.role === 'manager') ? 'manager' : 'staff';

        this.usineService.assignUser(siteId, { user_id: user.id, role: usineRole }).subscribe({
          next: () => {
            this.saving = false;
            this.userSaved.emit({ user, mode: 'create' });
            this.close();
          },
          error: (error) => {
            this.setApiError(error, "Utilisateur cree mais assignation d'usine impossible.");
            this.saving = false;
          },
        });
      },
      error: (error) => {
        this.setApiError(error, "Erreur lors de la creation de l'utilisateur.");
        this.saving = false;
      },
    });
  }

  private updateUser(): void {
    if (!this.userId) {
      this.setFormError('Utilisateur introuvable.');
      return;
    }

    this.saving = true;
    const payload: UpdateUserDto = {
      nom: this.model.nom.trim(),
      prenom: this.model.prenom.trim(),
      phone: this.normalizePhoneForApi(this.model.phone, this.model.code_pays),
      email: this.model.email.trim() || undefined,
      pays: this.model.pays,
      code_pays: this.model.code_pays,
      code_phone_pays: this.getCodePhonePays(this.model.code_pays),
      ville: this.model.ville.trim(),
      quartier: this.model.quartier.trim(),
      type: this.model.type,
      role: this.model.role,
      civilite: this.model.civilite ?? null,
      date_naissance: this.model.date_naissance || null,
      ...(this.model.site_id ? { site_id: this.model.site_id, site_role: 'staff' } : {}),
      ...(this.model.organisation_id ? { organisation_id: this.model.organisation_id } : {}),
    };

    this.userService.updateUser(this.userId, payload).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.saving = false;
          this.userSaved.emit({ user: response.data, mode: 'edit' });
          this.close();
          return;
        }
        this.setFormError(response.message || 'Modification impossible.');
        this.saving = false;
      },
      error: (error) => {
        this.setApiError(error, "Erreur lors de la modification de l'utilisateur.");
        this.saving = false;
      },
    });
  }

  private isFormValid(): boolean {
    this.phonePrefixError = null;

    const requiredMissing =
      !this.model.nom.trim() ||
      !this.model.prenom.trim() ||
      !this.model.phone.trim() ||
      !this.model.code_pays ||
      !this.model.ville.trim() ||
      !this.model.quartier.trim() ||
      !this.model.type ||
      !this.model.role;

    if (requiredMissing) {
      return false;
    }

    if (this.mode === 'create' && !this.model.site_id && this.usineContext.currentUsineId() === null) {
      this.setFormError('Le site est obligatoire.');
      return false;
    }

    if (!this.validatePhonePrefixAndNormalize()) {
      return false;
    }

    if (this.mode === 'create') {
      if (!this.model.password.trim()) {
        this.setFormError('Le mot de passe est obligatoire.');
        return false;
      }

      if (this.model.password.length < 8) {
        this.setFormError('Le mot de passe doit contenir au moins 8 caracteres.');
        return false;
      }

      this.model.password_confirmation = this.model.password;
    }

    return true;
  }

  private getCodePhonePays(codeCountry: string): string {
    const country = COUNTRIES.find((c) => c.code === codeCountry);
    return country ? country.dialCode : '+224';
  }

  private getCountryName(codeCountry: string): string {
    const country = COUNTRIES.find((c) => c.code === codeCountry);
    return country ? country.name : 'Guinee';
  }

  private normalizePhoneForApi(phone: string, codeCountry: string): string {
    const dialCode = this.getCodePhonePays(codeCountry);
    const dialDigits = dialCode.replace('+', '');
    let digits = (phone || '').replace(/\D/g, '');

    if (digits.startsWith(dialDigits) && digits.length > dialDigits.length) {
      digits = digits.slice(dialDigits.length);
    }

    return `${dialCode}${digits}`;
  }

  private resolveUserRole(user: User): string {
    const roleFromArray = user.role_names?.[0] ?? user.roles?.[0];
    if (roleFromArray) return roleFromArray;

    const raw = user as unknown as { role?: unknown; role_name?: unknown };
    if (typeof raw.role === 'string' && raw.role.trim()) return raw.role.trim();
    if (typeof raw.role_name === 'string' && raw.role_name.trim()) return raw.role_name.trim();

    return user.type === 'staff' ? this.getFirstStaffRoleValue() : user.type;
  }

  private resolveUserOrganisationId(user: User): number | null {
    const raw = user as unknown as {
      organisation_id?: unknown;
      organisation?: { id?: unknown } | null;
    };

    const direct = this.toNumberOrNull(raw.organisation_id);
    if (direct !== null) return direct;

    return this.toNumberOrNull(raw.organisation?.id);
  }

  private resolveUserSiteId(user: User): number | null {
    const raw = user as unknown as {
      site_id?: unknown;
      usine_id?: unknown;
      default_site_id?: unknown;
      default_usine_id?: unknown;
      current_site_id?: unknown;
      current_usine_id?: unknown;
      site?: { id?: unknown } | null;
      usine?: { id?: unknown } | null;
      current_site?: { id?: unknown } | null;
      current_usine?: { id?: unknown } | null;
      default_site?: { id?: unknown } | null;
      default_usine?: { id?: unknown } | null;
      sites?: unknown;
      usines?: unknown;
      accessible_sites?: unknown;
      accessible_usines?: unknown;
    };

    const directId = (
      this.toNumberOrNull(raw.site_id) ??
      this.toNumberOrNull(raw.usine_id) ??
      this.toNumberOrNull(raw.default_site_id) ??
      this.toNumberOrNull(raw.default_usine_id) ??
      this.toNumberOrNull(raw.current_site_id) ??
      this.toNumberOrNull(raw.current_usine_id) ??
      this.toNumberOrNull(raw.site?.id) ??
      this.toNumberOrNull(raw.usine?.id) ??
      this.toNumberOrNull(raw.current_site?.id) ??
      this.toNumberOrNull(raw.current_usine?.id) ??
      this.toNumberOrNull(raw.default_site?.id) ??
      this.toNumberOrNull(raw.default_usine?.id)
    );

    if (directId !== null) return directId;

    const listKeys = [raw.sites, raw.usines, raw.accessible_sites, raw.accessible_usines];
    for (const listValue of listKeys) {
      const siteId = this.extractPreferredSiteIdFromList(listValue);
      if (siteId !== null) return siteId;
    }

    return null;
  }

  private resolveUserSiteLabel(user: User): string | null {
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

      const preferred = value.find((entry) => this.isDefaultSiteEntry(entry)) ?? value[0];
      const label = this.extractSiteName(preferred);
      if (label) return label;
    }

    return null;
  }

  private extractPreferredSiteIdFromList(value: unknown): number | null {
    if (!Array.isArray(value) || value.length === 0) return null;

    const preferred = value.find((entry) => this.isDefaultSiteEntry(entry)) ?? value[0];
    return this.extractSiteId(preferred);
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

  private extractSiteId(value: unknown): number | null {
    if (!value || typeof value !== 'object') return null;
    const raw = value as Record<string, unknown>;
    return (
      this.toNumberOrNull(raw['id']) ??
      this.toNumberOrNull(raw['site_id']) ??
      this.toNumberOrNull(raw['usine_id'])
    );
  }

  private extractSiteName(value: unknown): string | null {
    if (typeof value === 'string') return this.toStringValue(value);
    if (!value || typeof value !== 'object') return null;

    const raw = value as Record<string, unknown>;
    const keys = ['nom', 'name', 'label', 'site_name', 'site_nom', 'usine_name', 'usine_nom'];
    for (const key of keys) {
      const label = this.toStringValue(raw[key]);
      if (label) return label;
    }

    return null;
  }

  private toStringValue(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private capitalize(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private getDefaultModel(): UserDialogForm {
    const firstType = this.userTypeOptions[0]?.value ?? 'staff';

    return {
      nom: '',
      prenom: '',
      phone: '',
      email: '',
      organisation_id: null,
      site_id: null,
      code_pays: 'GN',
      pays: this.getCountryName('GN'),
      ville: 'Conakry',
      quartier: '',
      type: firstType,
      role: '',
      civilite: null,
      date_naissance: null,
      password: '',
      password_confirmation: '',
    };
  }

  private applyCreateDefaults(): void {
    if (this.mode !== 'create') return;

    if (!this.model.type) {
      this.model.type = this.userTypeOptions[0]?.value ?? 'staff';
    }

    if (this.model.type !== 'staff') {
      this.model.role = this.model.type;
      return;
    }

    if (!this.model.role) {
      this.model.role = this.getFirstStaffRoleValue();
    }
  }

  private clearCreateSensitiveFields(): void {
    this.model.email = '';
    this.model.password = '';
    this.model.password_confirmation = '';
  }

  private getFirstStaffRoleValue(): string {
    const firstStaffRole = this.availableRoles.find((role) => this.staffRoles.includes(role.value));
    if (firstStaffRole) return firstStaffRole.value;
    return this.staffRoles[0] ?? 'admin_entreprise';
  }

  private resetState(): void {
    this.loading = false;
    this.saving = false;
    this.submitted = false;
    this.setFormError(null);
    this.phonePrefixError = null;
    this.loadedUser = null;
    this.pendingSiteLabel = null;
    this.model = this.getDefaultModel();
    this.refreshSiteOptions();
  }

  private setFormError(message: string | null, details: string[] = []): void {
    this.formError = message;
    this.formErrors = details;
  }

  private setApiError(error: unknown, fallback: string): void {
    const validationMessages = this.extractValidationMessages(error);
    if (validationMessages.length > 0) {
      this.setFormError(validationMessages[0], validationMessages);
      return;
    }

    const apiMessage = (error as ApiValidationErrorShape)?.error?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      this.setFormError(apiMessage.trim());
      return;
    }

    this.setFormError(fallback);
  }

  private extractValidationMessages(error: unknown): string[] {
    const errors = (error as ApiValidationErrorShape)?.error?.errors;
    if (!errors || typeof errors !== 'object') return [];

    return Object.values(errors)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .map((message) => String(message).trim())
      .filter((message) => message.length > 0);
  }

  private validatePhonePrefixAndNormalize(): boolean {
    const rawPhone = this.model.phone || '';
    const selectedDialCode = this.getCodePhonePays(this.model.code_pays);
    const selectedCountry = this.getCountryName(this.model.code_pays);
    const selectedDialDigits = selectedDialCode.replace('+', '');

    const rawTrimmed = rawPhone.trim();
    let digitsOnly = rawTrimmed.replace(/\D/g, '');

    if (!digitsOnly) {
      this.phonePrefixError = 'Telephone obligatoire.';
      return false;
    }

    if (digitsOnly.startsWith(selectedDialDigits) && digitsOnly.length > selectedDialDigits.length) {
      digitsOnly = digitsOnly.slice(selectedDialDigits.length);
    }

    const detectedOtherCountry = COUNTRIES.find((country) => {
      if (country.code === this.model.code_pays) return false;
      const dialDigits = country.dialCode.replace('+', '');
      return digitsOnly.startsWith(dialDigits) && digitsOnly.length > dialDigits.length + 3;
    });

    if (detectedOtherCountry && (rawTrimmed.startsWith('+') || rawTrimmed.startsWith('00'))) {
      this.phonePrefixError = `Le numero commence par ${detectedOtherCountry.dialCode} (${detectedOtherCountry.name}). Selectionnez ce pays ou corrigez le prefixe.`;
      return false;
    }

    this.model.phone = digitsOnly;
    this.phonePrefixError = null;
    return true;
  }

  private loadOrganisations(): void {
    this.organisationService.getAll().subscribe({
      next: (organisations) => {
        this.organisationOptions = organisations.map((organisation) => ({
          label: organisation.nom,
          value: organisation.id,
        }));
      },
      error: () => {
        this.organisationOptions = [];
      },
    });
  }

  private loadSites(): void {
    this.usineService.getAll().subscribe({
      next: (response) => {
        this.allSites = this.extractSitesFromResponse(response)
          .slice()
          .sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
        this.refreshSiteOptions();
      },
      error: () => {
        this.allSites = [];
        this.refreshSiteOptions();
      },
    });
  }

  private refreshSiteOptions(): void {
    if (this.allSites.length === 0) {
      this.siteOptions = [];
      return;
    }

    const organisationId = this.model.organisation_id;
    const hasOrganisationData = this.allSites.some((site) => this.resolveSiteOrganisationId(site) !== null);

    let filteredSites = this.allSites;
    if (organisationId && hasOrganisationData) {
      filteredSites = this.allSites.filter((site) => this.resolveSiteOrganisationId(site) === organisationId);
      if (filteredSites.length === 0) {
        filteredSites = this.allSites;
      }
    }

    this.siteOptions = filteredSites.map((site) => ({
      label: site.nom,
      value: site.id,
    }));

    if (!this.model.site_id && this.pendingSiteLabel) {
      const normalizedPendingLabel = this.pendingSiteLabel.trim().toLowerCase();
      const matchingSite = this.siteOptions.find(
        (site) => site.label.trim().toLowerCase() === normalizedPendingLabel,
      );
      if (matchingSite) {
        this.model.site_id = matchingSite.value;
        this.pendingSiteLabel = null;
      }
    }

    if (!this.model.site_id && this.mode === 'edit' && organisationId && this.siteOptions.length === 1) {
      this.model.site_id = this.siteOptions[0].value;
    }

    if (this.model.site_id && !this.siteOptions.some((site) => site.value === this.model.site_id)) {
      this.model.site_id = null;
    }
  }

  private toNumberOrNull(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private resolveSiteOrganisationId(site: Usine): number | null {
    const raw = site as Usine & { organisation?: { id?: unknown } | null };
    return this.toNumberOrNull(raw.organisation_id) ?? this.toNumberOrNull(raw.organisation?.id);
  }

  private extractSitesFromResponse(response: unknown): Usine[] {
    const data = (response as { data?: unknown })?.data;
    if (Array.isArray(data)) return data as Usine[];

    const nestedData = (data as { data?: unknown })?.data;
    if (Array.isArray(nestedData)) return nestedData as Usine[];

    return [];
  }

  private toLocalPhone(phone: string, codeCountry: string): string {
    const dialCode = this.getCodePhonePays(codeCountry);
    const dialDigits = dialCode.replace('+', '');
    let digits = (phone || '').replace(/\D/g, '');

    if (digits.startsWith(dialDigits) && digits.length > dialDigits.length) {
      digits = digits.slice(dialDigits.length);
    }

    return digits;
  }
}
