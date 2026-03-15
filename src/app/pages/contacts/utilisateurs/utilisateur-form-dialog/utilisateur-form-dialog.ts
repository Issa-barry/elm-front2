import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';

import { COUNTRIES } from '@/models/country.model';
import { CIVILITE_LABELS, Civilite, CreateUserDto, User, UserType } from '@/models/user.model';
import { RoleService } from '@/services/role/role.service';
import { UsineContextService } from '@/services/usine/usine-context.service';
import { UsineService } from '@/services/usine/usine.service';
import { UpdateUserDto, UserService } from '@/services/users/users.service';

type DialogMode = 'create' | 'edit';

type RoleOption = {
  label: string;
  value: string;
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
  private rolesLoaded = false;

  model: UserDialogForm = this.getDefaultModel();

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private usineContext: UsineContextService,
    private usineService: UsineService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
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

    this.loadRoles();

    if (this.mode === 'edit' && this.userId) {
      this.loadUser(this.userId);
      return;
    }

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
    this.userService.getUser(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.loadedUser = response.data;
          this.model = {
            nom: response.data.nom ?? '',
            prenom: response.data.prenom ?? '',
            phone: response.data.phone ?? '',
            email: response.data.email ?? '',
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
    const currentUsineId = this.usineContext.currentUsineId();
    if (currentUsineId === null) {
      this.setFormError("Veuillez selectionner une usine avant de creer un utilisateur.");
      return;
    }

    this.saving = true;

    const password = this.model.password;
    const passwordConfirmation = this.model.password;

    const payload: CreateUserDto = {
      nom: this.model.nom.trim(),
      prenom: this.model.prenom.trim(),
      phone: this.normalizePhone(this.model.phone),
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

        this.usineService.assignUser(currentUsineId, { user_id: user.id, role: usineRole }).subscribe({
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
      phone: this.normalizePhone(this.model.phone),
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

  private normalizePhone(phone: string): string {
    return (phone || '').replace(/[^\d+]/g, '');
  }

  private resolveUserRole(user: User): string {
    const roleFromArray = user.role_names?.[0] ?? user.roles?.[0];
    if (roleFromArray) return roleFromArray;

    const raw = user as unknown as { role?: unknown; role_name?: unknown };
    if (typeof raw.role === 'string' && raw.role.trim()) return raw.role.trim();
    if (typeof raw.role_name === 'string' && raw.role_name.trim()) return raw.role_name.trim();

    return user.type === 'staff' ? this.getFirstStaffRoleValue() : user.type;
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
    this.model = this.getDefaultModel();
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

    let sanitized = rawPhone.trim().replace(/[^\d+]/g, '');

    if (sanitized.startsWith('00')) {
      sanitized = `+${sanitized.slice(2)}`;
    }

    if (!sanitized) {
      this.phonePrefixError = 'Telephone obligatoire.';
      return false;
    }

    if (sanitized.startsWith('+')) {
      if (!sanitized.startsWith(selectedDialCode)) {
        const detectedCountry = COUNTRIES.find(
          (country) => country.code !== this.model.code_pays && sanitized.startsWith(country.dialCode)
        );

        this.phonePrefixError = detectedCountry
          ? `Le numero commence par ${detectedCountry.dialCode} (${detectedCountry.name}) mais le pays selectionne est ${selectedCountry} (${selectedDialCode}).`
          : `Le numero doit commencer par ${selectedDialCode} pour le pays selectionne (${selectedCountry}).`;
        return false;
      }

      this.model.phone = sanitized;
      this.phonePrefixError = null;
      return true;
    }

    if (sanitized.startsWith(selectedDialDigits)) {
      this.model.phone = `+${sanitized}`;
      this.phonePrefixError = null;
      return true;
    }

    const detectedWithoutPlus = COUNTRIES.find((country) => {
      if (country.code === this.model.code_pays) return false;
      const dialDigits = country.dialCode.replace('+', '');
      return sanitized.startsWith(dialDigits);
    });

    if (detectedWithoutPlus) {
      this.phonePrefixError = `Le numero commence par ${detectedWithoutPlus.dialCode} (${detectedWithoutPlus.name}). Selectionnez ce pays ou corrigez le prefixe.`;
      return false;
    }

    this.model.phone = `${selectedDialCode}${sanitized}`;
    this.phonePrefixError = null;
    return true;
  }
}
