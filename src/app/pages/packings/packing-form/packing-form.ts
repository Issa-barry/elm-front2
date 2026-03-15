import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';

import { Packing, CreatePackingDto, PackingStatut, PACKING_STATUT_LABELS } from '@/models/packing.model';
import { Prestataire } from '@/models/prestataire.model';
import { MoneyPipe } from '@/app/pipes/money.pipe';
import { PhoneFormatPipe } from '@/app/pipes/phone-format.pipe';

class PackingFormModel {
  id?: number; 
  prestataire_id?: number;
  prestataire?: Prestataire;
  reference?: string;
  date?: Date | string | null;
  nb_rouleaux = 0;
  prix_par_rouleau = 0;
  montant = 0;
  statut: PackingStatut = 'impayee';
  notes?: string | null;

  constructor(data?: Partial<Packing>) {
    if (data) {
      this.id = data.id;
      this.prestataire_id = data.prestataire_id;
      this.prestataire = data.prestataire;
      this.reference = data.reference;
      this.date = data.date ? new Date(data.date) : null;
      this.nb_rouleaux = data.nb_rouleaux || 0;
      this.prix_par_rouleau = data.prix_par_rouleau || 0;
      this.montant = data.montant || 0;
      this.statut = data.statut || 'impayee';
      this.notes = data.notes;
    }
  }

  calculateMontant(): void {
    this.montant = this.nb_rouleaux * this.prix_par_rouleau;
  }
}

@Component({
  selector: 'app-packing-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePickerModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    RippleModule,
    SkeletonModule,
    MoneyPipe,
    PhoneFormatPipe,
  ],
  templateUrl: './packing-form.html',
  styleUrl: './packing-form.scss',
})
export class PackingForm implements OnInit, OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initialData: Packing | null = null;
  @Input() prestataires: Prestataire[] = [];
  @Input() loading = false;
  @Input() loadingPrestataires = false;
  @Input() loadingPrixRouleau = false;
  @Input() defaultPrixRouleau = 0;

  @Output() submitForm = new EventEmitter<CreatePackingDto>();
  @Output() cancel = new EventEmitter<void>();

  submitted = false;
  isEditing = false;
  model: PackingFormModel = new PackingFormModel();
  dateError: string | null = null;

  get statutLabel(): string {
    return PACKING_STATUT_LABELS[this.model.statut] ?? this.model.statut;
  }

  get filteredPrestataires(): Prestataire[] {
    const selectedId = this.model.prestataire_id;
    return (this.prestataires ?? []).filter((prestataire) => {
      if (selectedId && prestataire.id === selectedId) return true;
      return prestataire.type === 'machiniste';
    });
  }

  get fieldsDisabled(): boolean {
    return this.loading || (this.mode === 'edit' && !this.isEditing);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && changes['initialData'].currentValue) {
      this.model = new PackingFormModel(this.initialData ?? undefined);
      this.model.calculateMontant();
    }

    if (
      changes['defaultPrixRouleau'] &&
      !changes['defaultPrixRouleau'].firstChange &&
      this.mode === 'create' &&
      this.defaultPrixRouleau > 0 &&
      this.model.prix_par_rouleau === 0
    ) {
      this.model.prix_par_rouleau = this.defaultPrixRouleau;
      this.model.calculateMontant();
    }
  }

  ngOnInit(): void {
    this.model = this.initialData ? new PackingFormModel(this.initialData) : new PackingFormModel();
    this.isEditing = this.mode === 'create';

    if (!this.model.date) {
      this.model.date = new Date();
    }

    if (this.mode === 'create' && this.defaultPrixRouleau > 0 && this.model.prix_par_rouleau === 0) {
      this.model.prix_par_rouleau = this.defaultPrixRouleau;
    }

    this.model.calculateMontant();
  }

  onPrixOrQuantityChange(): void {
    if (!this.model.nb_rouleaux || !this.model.prix_par_rouleau) {
      this.model.montant = 0;
      return;
    }
    this.model.calculateMontant();
  }

  validateDate(): boolean {
    if (!this.model.date) {
      this.dateError = 'Date obligatoire.';
      return false;
    }
    this.dateError = null;
    return true;
  }

  onDateChange(): void {
    if (this.submitted) this.validateDate();
  }

  onEnterKey(event: Event): void {
    event.preventDefault();
    if (this.mode === 'edit' && !this.isEditing) return;
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.mode === 'edit' && !this.isEditing) return;
    this.submitted = true;

    if (!this.isValid()) return;

    this.model.calculateMontant();

    const packingData: CreatePackingDto = {
      prestataire_id: this.model.prestataire_id!,
      date: this.formatDate(this.model.date),
      nb_rouleaux: this.model.nb_rouleaux,
      prix_par_rouleau: this.model.prix_par_rouleau,
      notes: this.model.notes ?? undefined,
    };

    this.submitForm.emit(packingData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  enableEditing(): void {
    if (this.mode !== 'edit') return;
    this.isEditing = true;
  }

  private isValid(): boolean {
    return !!(
      this.model.prestataire_id &&
      this.model.date &&
      this.model.nb_rouleaux &&
      this.model.nb_rouleaux > 0 &&
      this.model.prix_par_rouleau &&
      this.model.prix_par_rouleau > 0
    ) && this.validateDate();
  }

  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
