import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';

import {
  CommandeVente,
  CommandeVenteActor,
  MODE_PAIEMENT_OPTIONS,
  ModePaiement,
  STATUT_FACTURE_LABELS,
  StatutFacture,
} from '@/models/vente.model';
import { CommandeVenteService } from '@/services/ventes/commande-vente.service';
import { FactureLivraisonService } from '@/services/livraisons/facture-livraison.service';
import { MoneyPipe } from '@/app/pipes/money.pipe';
import { PhoneFormatPipe } from '@/app/pipes/phone-format.pipe';

interface QuantityOption {
  label: string;
  value: number;
}

interface ProductRow {
  id: number;
  name: string;
  unitPrice: number;
  quantity: number;
  totalLigne: number;
  imageUrl: string;
}

interface CommandeInformationPanel {
  createdAtLabel: string;
  creatorLabel: string;
  creatorNom: string;
  creatorPrenom: string;
  creatorPhone: string;
  vehiculeNom: string;
  vehiculeImmatriculation: string;
  livreurNom: string;
  livreurPhone: string;
}

@Component({
  selector: 'app-vente-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    ToastModule,
    InputNumberModule,
    DatePickerModule,
    MoneyPipe,
    PhoneFormatPipe,
  ],
  providers: [MessageService],
  templateUrl: './vente-details.html',
  styleUrl: './vente-details.scss',
})
export class VenteDetails implements OnInit {
  readonly loading = signal(false);
  readonly commande = signal<CommandeVente | null>(null);

  // Annulation dialog state
  annulationDialogVisible = false;
  annulationLoading = false;
  motifAnnulation = '';

  // Encaissement dialog state
  encaissementDialogVisible = false;
  encaissementLoading = false;
  encaissementMontant: number | null = null;
  encaissementMode: ModePaiement | null = null;
  encaissementDate: Date | null = null;
  encaissementNote = '';
  readonly modePaiementOptions = MODE_PAIEMENT_OPTIONS;

  readonly products = computed<ProductRow[]>(() =>
    (this.commande()?.lignes ?? []).map((ligne) => {
      const prixUnitaire = this.toNumber(ligne.prix_vente_snapshot);
      const totalFromApi = this.toNumber(ligne.total_ligne);
      const totalLigne = Number.isFinite(totalFromApi)
        ? totalFromApi
        : prixUnitaire * Math.max(1, ligne.qte ?? 1);
      const rawImage = ligne.produit?.image_url;
      const imageUrl = rawImage
        ? rawImage.startsWith('http://') || rawImage.startsWith('https://')
          ? rawImage
          : `assets/demo/images/produits/${rawImage}`
        : 'assets/demo/images/no-product.png';
      return {
        id: ligne.id,
        name: ligne.produit?.nom ?? `Produit #${ligne.produit_id}`,
        unitPrice: Number.isFinite(prixUnitaire) ? prixUnitaire : 0,
        quantity: Math.max(1, ligne.qte ?? 1),
        totalLigne,
        imageUrl,
      };
    })
  );

  readonly isAnnulee = computed(() => this.commande()?.statut === 'annulee');

  readonly statutLabel = computed(() => {
    const statut = this.commande()?.facture?.statut_facture;
    return statut ? this.getStatutLabel(statut) : 'Impayee';
  });

  readonly canAnnuler = computed(() => {
    if (this.isAnnulee()) return false;
    const statut = this.commande()?.facture?.statut_facture;
    return !statut || statut === 'impayee';
  });

  readonly statutBadgeClass = computed(() => {
    const statut = this.commande()?.facture?.statut_facture;
    switch (statut) {
      case 'payee':
        return 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/40 dark:bg-green-500/15 dark:text-green-300';
      case 'partiel':
        return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/15 dark:text-orange-300';
      case 'annulee':
        return 'border-surface-300 bg-surface-100 text-surface-700 dark:border-surface-500/40 dark:bg-surface-500/15 dark:text-surface-200';
      case 'impayee':
      default:
        return 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-300';
    }
  });

  readonly restantDu = computed(() => {
    const commande = this.commande();
    if (!commande) return 0;

    const restantFacture = commande.facture?.montant_restant;
    if (typeof restantFacture === 'number' && Number.isFinite(restantFacture)) {
      return Math.max(0, restantFacture);
    }

    const total = this.toNumber(commande.total_commande);
    const encaisse = this.toNumber(commande.facture?.montant_encaisse ?? 0);
    if (!Number.isFinite(total)) return 0;
    const safeEncaisse = Number.isFinite(encaisse) ? encaisse : 0;
    return Math.max(0, total - safeEncaisse);
  });

  readonly restantToneClass = computed(() =>
    this.restantDu() > 0 ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'
  );

  readonly encaisseToneClass = computed(() => {
    const encaisse = this.toNumber(this.commande()?.facture?.montant_encaisse ?? 0);
    return Number.isFinite(encaisse) && encaisse > 0
      ? 'text-green-600 dark:text-green-300'
      : 'text-surface-900 dark:text-surface-0';
  });

  readonly livreurNom = computed(() => {
    const livreur = this.commande()?.vehicule?.livreurPrincipal ?? this.commande()?.vehicule?.livreur_principal;
    if (!livreur) return '-';
    return `${livreur.prenom} ${livreur.nom}`.trim() || '-';
  });

  readonly livreurPhone = computed(() => {
    const livreur = this.commande()?.vehicule?.livreurPrincipal ?? this.commande()?.vehicule?.livreur_principal;
    return livreur?.phone ?? '-';
  });

  readonly vehiculeNom = computed(() => this.commande()?.vehicule?.nom_vehicule ?? '-');

  readonly annulationInfo = computed(() => {
    const c = this.commande();
    if (!c || c.statut !== 'annulee') return null;
    return {
      annulee_at: c.annulee_at,
      annulee_par: c.annulee_par,
      motif_annulation: c.motif_annulation,
    };
  });

  readonly informationPanel = computed<CommandeInformationPanel | null>(() => {
    const commande = this.commande();
    if (!commande) return null;
    const creator = this.extractCreatorInfo(commande);
    const vehicule = commande.vehicule;

    return {
      createdAtLabel: this.formatDateTime(commande.created_at),
      creatorLabel: creator.label,
      creatorNom: creator.nom,
      creatorPrenom: creator.prenom,
      creatorPhone: creator.phone,
      vehiculeNom: vehicule?.nom_vehicule ?? '-',
      vehiculeImmatriculation: vehicule?.immatriculation ?? '-',
      livreurNom: this.livreurNom(),
      livreurPhone: this.livreurPhone(),
    };
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly commandeService: CommandeVenteService,
    private readonly factureService: FactureLivraisonService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/ventes']);
      return;
    }
    this.loadCommande(id);
  }

  goBack(): void {
    this.router.navigate(['/ventes']);
  }

  openEncaissementDialog(): void {
    this.encaissementMontant = this.restantDu() > 0 ? this.restantDu() : null;
    this.encaissementMode = 'especes';
    this.encaissementDate = new Date();
    this.encaissementNote = '';
    this.encaissementDialogVisible = true;
  }

  confirmerEncaissement(): void {
    const factureId = this.commande()?.facture?.id;
    if (!factureId || !this.encaissementMontant || !this.encaissementMode) return;
    const selectedDate = this.encaissementDate ?? new Date();
    this.encaissementDate = selectedDate;
    this.encaissementLoading = true;
    const dto = {
      facture_vente_id: factureId,
      montant: this.encaissementMontant,
      date_encaissement: selectedDate.toISOString().split('T')[0],
      mode_paiement: this.encaissementMode,
      note: this.encaissementNote.trim() || undefined,
    };
    this.factureService.createEncaissement(dto).subscribe({
      next: () => {
        this.encaissementLoading = false;
        this.encaissementDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Encaissement enregistré', life: 3000 });
        const id = this.commande()?.id;
        if (id) this.loadCommande(id);
      },
      error: (err) => {
        this.encaissementLoading = false;
        const msg = err?.error?.message ?? 'Une erreur est survenue.';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 5000 });
      },
    });
  }

  openAnnulationDialog(): void {
    this.motifAnnulation = '';
    this.annulationDialogVisible = true;
  }

  confirmerAnnulation(): void {
    const id = this.commande()?.id;
    if (!id || this.annulationLoading || !this.motifAnnulation.trim()) return;
    this.annulationLoading = true;
    this.commandeService.annulerCommande(id, { motif_annulation: this.motifAnnulation.trim() }).subscribe({
      next: (resp) => {
        this.annulationLoading = false;
        this.annulationDialogVisible = false;
        this.commande.set(resp.data ?? null);
        this.messageService.add({
          severity: 'success',
          summary: 'Commande annulée',
          detail: 'La commande a été annulée et les stocks ont été restaurés.',
          life: 4000,
        });
      },
      error: (err) => {
        this.annulationLoading = false;
        const msg = err?.error?.message ?? "Une erreur est survenue lors de l'annulation.";
        this.messageService.add({ severity: 'warn', summary: 'Action impossible', detail: msg, life: 5000 });
      },
    });
  }

  goFacture(): void {
    const factureId = this.commande()?.facture?.id;
    if (factureId) {
      this.router.navigate(['/ventes/factures-vente-detail3', factureId]);
    }
  }

  quantityOptionFor(quantity: number): QuantityOption[] {
    const safeValue = Math.max(1, quantity);
    return [{ label: String(safeValue), value: safeValue }];
  }

  getStatutLabel(s: StatutFacture): string {
    return STATUT_FACTURE_LABELS[s] ?? s;
  }

  shouldShowEncaissementDate(): boolean {
    if (!this.encaissementDate) return true;
    return !this.isToday(this.encaissementDate);
  }

  formatDateTime(d: string | undefined): string {
    if (!d) return '-';
    return new Date(d).toLocaleString('fr-FR');
  }

  loadCommande(id: number): void {
    this.loading.set(true);
    this.commandeService.getCommande(id).subscribe({
      next: (resp) => {
        this.commande.set(resp.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/ventes']);
      },
    });
  }

  private toNumber(value: string | number | null | undefined): number {
    if (value == null || value === '') return Number.NaN;
    return typeof value === 'string' ? Number.parseFloat(value) : value;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  }

  private extractCreatorInfo(commande: CommandeVente): { label: string; nom: string; prenom: string; phone: string } {
    const raw = commande as any;

    const updatedActor = this.toActor(
      commande.updated_by ?? commande.updated_by_user ?? raw?.updatedByUser ?? null
    );
    if (updatedActor) {
      return this.normalizeActorInfo(updatedActor, 'Modifie par :');
    }

    const createdActor = this.toActor(
      commande.created_by ??
      commande.created_by_user ??
      commande.creator ??
      raw?.createdByUser ??
      raw?.creator ??
      raw?.createur ??
      raw?.user ??
      null
    );
    if (createdActor) {
      return this.normalizeActorInfo(createdActor, 'Cree par :');
    }

    return { label: 'Cree par :', nom: '-', prenom: '-', phone: '-' };
  }

  private toActor(source: unknown): CommandeVenteActor | null {
    if (!source || typeof source !== 'object') return null;
    return source as CommandeVenteActor;
  }

  private normalizeActorInfo(
    source: CommandeVenteActor,
    label: string
  ): { label: string; nom: string; prenom: string; phone: string } {
    const raw = source as any;
    let nom = this.pickFirstString([source.nom, raw?.last_name, raw?.lastname]);
    let prenom = this.pickFirstString([source.prenom, raw?.first_name, raw?.firstname]);
    const fullName = this.pickFirstString([source.nom_complet, raw?.full_name, source.name]);
    const phone = this.pickFirstString([source.phone, raw?.telephone, raw?.tel]) ?? '-';

    if ((!nom || !prenom) && fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      if (!prenom && parts.length > 0) prenom = parts[0];
      if (!nom) nom = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
    }

    return {
      label,
      nom: nom ?? '-',
      prenom: prenom ?? '-',
      phone,
    };
  }

  private pickFirstString(values: unknown[]): string | null {
    for (const value of values) {
      if (typeof value === 'string') {
        const s = value.trim();
        if (s.length > 0) return s;
      }
    }
    return null;
  }
}
