import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { RippleModule } from 'primeng/ripple';
import { forkJoin } from 'rxjs';

import { VehiculeService } from '@/services/vehicules/vehicule.service';
import { ProprietaireService } from '@/services/proprietaires/proprietaire.service';
import { LivreurService } from '@/services/livreurs/livreur.service';
import { UsineContextService } from '@/services/usine/usine-context.service';
import { UsineService } from '@/services/usine/usine.service';
import {
  CAPACITE_DEFAULTS,
  Livreur,
  Proprietaire,
  TYPE_VEHICULE_OPTIONS,
  Vehicule,
} from '@/models/vehicule.model';
import { AccessibleUsine } from '@/models/usine.model';
import { PhoneFormatPipe } from '@/app/pipes/phone-format.pipe';

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToastModule,
    TooltipModule,
    SkeletonModule,
    ToggleSwitchModule,
    PhoneFormatPipe,
  ],
  providers: [MessageService],
  templateUrl: './vehicule-form.html',
  styleUrl: './vehicule-form.scss',
})
export class VehiculeForm implements OnInit {
  @Input() vehicule?: Vehicule;

  get isEditMode(): boolean {
    return !!this.vehicule;
  }

  form!: FormGroup;
  loading = false;
  loadingData = false;
  photoFile: File | null = null;
  photoPreview: string | null = null;

  readonly usineOptions = signal<AccessibleUsine[]>([]);
  readonly proprietaires = signal<(Proprietaire & { _label: string })[]>([]);
  readonly livreurs = signal<(Livreur & { _label: string })[]>([]);

  typeVehiculeOptions = TYPE_VEHICULE_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private vehiculeService: VehiculeService,
    private proprietaireService: ProprietaireService,
    private livreurService: LivreurService,
    private usineService: UsineService,
    private messageService: MessageService,
    public router: Router,
    public usineContext: UsineContextService,
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    if (this.vehicule) {
      this.applyVehiculeToForm(this.vehicule);
    }

    const fromContext = this.usineContext.accessibleUsines();
    if (fromContext.length > 0) {
      this.usineOptions.set(fromContext);
    } else {
      this.usineService.getAll().subscribe({
        next: (resp) => {
          const list: AccessibleUsine[] = (resp.data ?? []).map((u) => ({
            id: u.id,
            nom: u.nom,
            code: u.code,
            type: u.type,
            statut: u.statut,
          }));
          this.usineOptions.set(list);
          if (list.length > 0 && this.usineContext.currentUsineId() === null) {
            const fallback = list.find((u) => u.id === this.usineContext.defaultUsineId()) ?? list[0];
            this.usineContext.switchUsine(fallback.id);
          }
        },
        error: () => {},
      });
    }

    this.loadingData = true;
    forkJoin({
      proprietaires: this.proprietaireService.getAll('actif'),
      livreurs: this.livreurService.getAll('actif'),
    }).subscribe({
      next: ({ proprietaires, livreurs }) => {
        this.proprietaires.set(
          (proprietaires.data?.data ?? []).map((p) => ({
            ...p,
            _label: `${p.prenom} ${p.nom} - ${p.phone}`,
          })),
        );
        this.livreurs.set(
          (livreurs.data?.data ?? []).map((l) => ({
            ...l,
            _label: `${l.prenom} ${l.nom} - ${l.phone}`,
          })),
        );
        this.loadingData = false;
      },
      error: () => {
        this.loadingData = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Chargement partiel',
          detail: 'Impossible de charger la liste des propriétaires / livreurs.',
          life: 5000,
        });
      },
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nom_vehicule: ['', [Validators.required, Validators.maxLength(100)]],
      marque: [null, Validators.maxLength(100)],
      modele: [null, Validators.maxLength(100)],
      immatriculation: ['', [Validators.required, Validators.maxLength(20)]],
      type_vehicule: [null, Validators.required],
      capacite_packs: [null],
      proprietaire_id: [null, Validators.required],
      livreur_principal_id: [null],
      is_active: [true],
    });
  }

  get usineMissing(): boolean {
    return !this.isEditMode && this.usineContext.currentUsineId() === null;
  }

  onUsineChange(id: number): void {
    this.usineContext.switchUsine(id);
  }

  onTypeVehiculeChange(type: string): void {
    const ctrl = this.form.get('capacite_packs');
    if (!ctrl || !type) return;
    const def = CAPACITE_DEFAULTS[type as keyof typeof CAPACITE_DEFAULTS];
    ctrl.setValue(def ?? null);
  }

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.photoPreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.photoFile = null;
    this.photoPreview = null;
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name)!;
    return c.invalid && (c.dirty || c.touched);
  }

  onSubmit(): void {
    if (this.usineMissing) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Usine requise',
        detail: 'Veuillez sélectionner une usine.',
        life: 5000,
      });
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;

    const req$ = this.isEditMode
      ? this.vehiculeService.update(this.vehicule!.id, this.buildFormData())
      : this.vehiculeService.create(this.buildFormData());

    req$.subscribe({
      next: (response) => {
        if (this.isEditMode && this.vehicule) {
          this.reloadEditedVehicule(this.vehicule.id);
          return;
        }

        this.loading = false;
        const createdId = response?.data?.id;
        if (createdId) {
          this.router.navigate(['/vehicules/edit', createdId]);
          return;
        }

        this.messageService.add({
          severity: 'warn',
          summary: 'Création terminée',
          detail: "Véhicule créé, mais l'identifiant est introuvable pour ouvrir l'édition.",
          life: 4000,
        });
        this.router.navigate(['/vehicules']);
      },
      error: (err) => {
        this.loading = false;
        this.handleApiError(err);
      },
    });
  }

  private buildFormData(): FormData {
    const v = this.form.value;
    const fd = new FormData();

    if (!this.isEditMode) {
      const usineId = this.usineContext.currentUsineId();
      if (usineId != null) fd.append('usine_id', String(usineId));
    }

    fd.append('nom_vehicule', v.nom_vehicule);
    if (v.marque) fd.append('marque', v.marque);
    if (v.modele) fd.append('modele', v.modele);
    fd.append('immatriculation', v.immatriculation);
    fd.append('type_vehicule', v.type_vehicule);
    if (v.capacite_packs != null) fd.append('capacite_packs', String(v.capacite_packs));
    fd.append('proprietaire_id', String(v.proprietaire_id));
    if (v.livreur_principal_id != null) fd.append('livreur_principal_id', String(v.livreur_principal_id));
    fd.append('is_active', v.is_active ? '1' : '0');
    if (this.photoFile) fd.append('photo', this.photoFile);

    return fd;
  }

  private reloadEditedVehicule(id: number): void {
    this.vehiculeService.getOne(id).subscribe({
      next: (resp) => {
        this.vehicule = resp.data;
        this.applyVehiculeToForm(resp.data);
        this.photoFile = null;
        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Véhicule mis à jour avec succès.',
          life: 3000,
        });
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Mise à jour enregistrée',
          detail: 'Le véhicule est modifié mais le rechargement a échoué.',
          life: 5000,
        });
      },
    });
  }

  private applyVehiculeToForm(vehicule: Vehicule): void {
    this.photoPreview = vehicule.photo_url ?? null;
    this.form.patchValue({
      nom_vehicule: vehicule.nom_vehicule,
      marque: vehicule.marque ?? null,
      modele: vehicule.modele ?? null,
      immatriculation: vehicule.immatriculation,
      type_vehicule: vehicule.type_vehicule,
      capacite_packs: vehicule.capacite_packs,
      proprietaire_id: vehicule.proprietaire_id,
      livreur_principal_id: vehicule.livreur_principal_id ?? null,
      is_active: vehicule.is_active,
    });
  }

  onCancel(): void {
    this.router.navigate(['/vehicules']);
  }

  private handleApiError(err: any): void {
    if (err.status === 422 && err.error?.errors) {
      const msgs = Object.values(err.error.errors).flat() as string[];
      msgs.forEach((m) =>
        this.messageService.add({ severity: 'error', summary: 'Erreur de validation', detail: m, life: 5000 }),
      );
      return;
    }

    const configs: Record<number, { severity: string; summary: string; detail: string }> = {
      401: { severity: 'error', summary: 'Session expirée', detail: 'Votre session a expiré. Veuillez vous reconnecter.' },
      403: { severity: 'error', summary: 'Accès refusé', detail: "Vous n'avez pas la permission." },
      409: { severity: 'warn', summary: 'Conflit', detail: err.error?.message || 'Cette immatriculation existe déjà pour cette usine.' },
      0: { severity: 'error', summary: 'Serveur inaccessible', detail: 'Impossible de joindre le serveur.' },
    };

    const cfg = configs[err.status] ?? {
      severity: 'error',
      summary: `Erreur ${err.status || ''}`.trim(),
      detail: err.error?.message || 'Une erreur inattendue est survenue.',
    };

    this.messageService.add({ ...cfg, life: 5000 });
  }
}
