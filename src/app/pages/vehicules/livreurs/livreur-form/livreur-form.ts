import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { RippleModule } from 'primeng/ripple';

import { LivreurService } from '@/services/livreurs/livreur.service';
import { Livreur } from '@/models/vehicule.model';
import { COUNTRIES, Country, DEFAULT_COUNTRY_CODE, getCountryByCode } from '@/models/country.model';

@Component({
  selector: 'app-livreur-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    ToggleSwitchModule,
    RippleModule,
  ],
  providers: [MessageService],
  templateUrl: './livreur-form.html',
  styleUrl: './livreur-form.scss',
})
export class LivreurForm implements OnInit {
  @Input() livreur?: Livreur;

  get isEditMode(): boolean {
    return !!this.livreur;
  }

  form!: FormGroup;
  loading = false;
  submitted = false;
  phoneCountry = DEFAULT_COUNTRY_CODE;
  phoneError: string | null = null;
  countries: Country[] = COUNTRIES;

  constructor(
    private fb: FormBuilder,
    private livreurService: LivreurService,
    private messageService: MessageService,
    public router: Router,
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    if (this.livreur) {
      this.applyLivreurToForm(this.livreur);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      prenom: ['', [Validators.required, Validators.maxLength(100)]],
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.maxLength(30)]],
      is_active: [true],
    });
  }

  validatePhone(): boolean {
    const phoneControl = this.form.get('phone');
    const rawPhone = String(phoneControl?.value ?? '').trim();

    if (!rawPhone) {
      this.phoneError = 'Telephone obligatoire.';
      return false;
    }

    const selectedCountry = this.getCountry(this.phoneCountry);
    if (!selectedCountry) {
      this.phoneError = 'Pays invalide.';
      return false;
    }

    const normalizedPhone = this.toPhoneCandidate(rawPhone);
    if (!normalizedPhone) {
      this.phoneError = 'Format invalide.';
      return false;
    }

    if (normalizedPhone.startsWith('+') && !normalizedPhone.startsWith(selectedCountry.dialCode)) {
      this.phoneError = `Le numero doit commencer par ${selectedCountry.dialCode} pour ${selectedCountry.name}.`;
      return false;
    }

    const nationalNumber = this.extractNationalNumber(normalizedPhone);
    if (nationalNumber.length < 6 || nationalNumber.length > 14) {
      this.phoneError = `Numero invalide pour ${this.getCountryName(this.phoneCountry)}.`;
      return false;
    }

    const formatted = `${selectedCountry.dialCode} ${this.formatNationalNumber(nationalNumber)}`.trim();
    phoneControl?.setValue(formatted, { emitEvent: false });
    this.phoneError = null;
    return true;
  }

  onPhoneInput(): void {
    if (this.submitted) {
      this.validatePhone();
    }
  }

  onPhoneBlur(): void {
    const value = String(this.form.get('phone')?.value ?? '').trim();
    if (value) {
      this.validatePhone();
    }
  }

  onCountryChange(): void {
    const phoneControl = this.form.get('phone');
    const rawPhone = String(phoneControl?.value ?? '').trim();

    if (!rawPhone) {
      this.phoneError = null;
      return;
    }

    const selectedCountry = this.getCountry(this.phoneCountry);
    if (!selectedCountry) {
      return;
    }

    const normalizedPhone = this.toPhoneCandidate(rawPhone);
    if (!normalizedPhone) {
      this.phoneError = 'Format invalide.';
      return;
    }

    const nationalNumber = this.extractNationalNumber(normalizedPhone);
    if (!nationalNumber) {
      this.phoneError = 'Format invalide.';
      return;
    }

    phoneControl?.setValue(`${selectedCountry.dialCode} ${this.formatNationalNumber(nationalNumber)}`, {
      emitEvent: false,
    });
    this.validatePhone();
  }

  getCountryName(code: string): string {
    return this.getCountry(code)?.name ?? code;
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name)!;
    return c.invalid && (c.dirty || c.touched);
  }

  onSubmit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) return;
    if (!this.validatePhone()) return;

    const v = this.form.value;
    this.loading = true;

    const payload = {
      prenom: String(v.prenom ?? '').trim(),
      nom: String(v.nom ?? '').trim(),
      phone: String(v.phone ?? '').trim(),
      is_active: !!v.is_active,
    };

    const req$ = this.isEditMode
      ? this.livreurService.update(this.livreur!.id, payload)
      : this.livreurService.create(payload);

    req$.subscribe({
      next: (response) => {
        if (this.isEditMode && this.livreur) {
          this.reloadEditedLivreur(this.livreur.id);
          return;
        }

        this.loading = false;
        const createdId = response?.data?.id;
        if (createdId) {
          this.router.navigate(['/vehicules/livreurs/edit', createdId]);
          return;
        }

        this.messageService.add({
          severity: 'warn',
          summary: 'Creation terminee',
          detail: "Livreur cree, mais l'identifiant est introuvable pour ouvrir l'edition.",
          life: 4000,
        });
        this.router.navigate(['/vehicules/livreurs']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422 && err.error?.errors) {
          (Object.values(err.error.errors).flat() as string[]).forEach((m) =>
            this.messageService.add({ severity: 'error', summary: 'Validation', detail: m, life: 5000 }),
          );
          return;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.error?.message || 'Erreur inattendue.',
          life: 5000,
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/vehicules/livreurs']);
  }

  private reloadEditedLivreur(id: number): void {
    this.livreurService.getOne(id).subscribe({
      next: (resp) => {
        this.livreur = resp.data;
        this.applyLivreurToForm(resp.data);
        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: 'Livreur mis a jour.',
          life: 3000,
        });
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Mise a jour enregistree',
          detail: 'Le livreur est modifie mais le rechargement a echoue.',
          life: 5000,
        });
      },
    });
  }

  private applyLivreurToForm(livreur: Livreur): void {
    this.detectPhoneCountry(livreur.phone);
    this.form.patchValue({
      prenom: livreur.prenom,
      nom: livreur.nom,
      phone: livreur.phone,
      is_active: livreur.is_active,
    });
  }

  private detectPhoneCountry(phone?: string | null): void {
    this.phoneCountry = DEFAULT_COUNTRY_CODE;
    const safePhone = this.toPhoneCandidate(phone ?? '');
    if (!safePhone.startsWith('+')) return;

    const matchedCountry = [...this.countries]
      .sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find((country) => safePhone.startsWith(country.dialCode));

    if (matchedCountry) {
      this.phoneCountry = matchedCountry.code;
    }
  }

  private toPhoneCandidate(rawPhone: string): string {
    const trimmed = rawPhone.trim();
    if (!trimmed) return '';

    const hasPlus = trimmed.startsWith('+');
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return '';

    return hasPlus ? `+${digits}` : digits;
  }

  private extractNationalNumber(phoneCandidate: string): string {
    const digits = phoneCandidate.replace(/\D/g, '');
    if (!phoneCandidate.startsWith('+')) {
      return digits;
    }

    const matchedCountry = [...this.countries]
      .sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find((country) => phoneCandidate.startsWith(country.dialCode));

    if (!matchedCountry) {
      return digits;
    }

    const dialDigits = matchedCountry.dialCode.replace(/\D/g, '');
    return digits.startsWith(dialDigits) ? digits.slice(dialDigits.length) : digits;
  }

  private formatNationalNumber(national: string): string {
    return national.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }

  private getCountry(code: string): Country | undefined {
    return getCountryByCode(code) ?? this.countries.find((c) => c.code === code);
  }
}
