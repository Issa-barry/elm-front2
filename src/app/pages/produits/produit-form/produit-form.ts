import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { RippleModule } from 'primeng/ripple';
import { CreateProduitDto, Produit, ProduitStatut, ProduitType } from '@/models/produit.model';
import { UsineContextService } from '@/services/usine/usine-context.service';

@Component({
    selector: 'app-produit-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        ToggleSwitchModule,
        FileUploadModule,
        RippleModule,
    ],
    templateUrl: './produit-form.html',
    styleUrl: './produit-form.scss',
})
export class ProduitForm implements OnInit, OnChanges {
    @ViewChild('fileUploader') fileUploader?: FileUpload;

    @Input() mode: 'create' | 'edit' = 'create';
    @Input() loading = false;
    @Input() initialProduit: Produit | null = null;

    @Output() submitForm = new EventEmitter<CreateProduitDto>();
    @Output() cancel = new EventEmitter<void>();
    @Output() uploadImage = new EventEmitter<File>();
    @Output() deleteImage = new EventEmitter<void>();

    private usineCtx = inject(UsineContextService);
    readonly currentUsine = this.usineCtx.currentUsine;

    product: Produit = this.emptyProduct();
    isEditing = false;
    submitted = false;

    imagePreview: string | null = null;
    imageError: string | null = null;
    selectedImageFile: File | null = null;
    confirmingDelete = false;

    canManageSystemDefinition = true;

    typeOptions: { label: string; value: ProduitType }[] = [
        { label: 'Matériel', value: 'materiel' },
        { label: 'Service', value: 'service' },
        { label: 'Fabricable', value: 'fabricable' },
        { label: 'Achat / Vente', value: 'achat_vente' },
    ];

    ngOnInit(): void {
        if (this.mode === 'create') {
            this.isEditing = true;
            this.product = this.emptyProduct();
        } else {
            this.isEditing = false;
            if (this.initialProduit) {
                this.product = Produit.fromApi(this.initialProduit);
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['initialProduit'] && this.initialProduit) {
            this.product = Produit.fromApi(this.initialProduit);

            // Peupler les prix depuis les prix effectifs (local > global)
            // pour les produits dont les prix sont stockés dans produit_usine_courant
            const eff = this.product.getPrixEffectifs();
            if (this.product.prix_usine == null && eff.prix_usine != null) this.product.prix_usine = eff.prix_usine;
            if (this.product.prix_vente == null && eff.prix_vente != null) this.product.prix_vente = eff.prix_vente;
            if (this.product.prix_achat == null && eff.prix_achat != null) this.product.prix_achat = eff.prix_achat;
            if (this.product.cout == null && eff.cout != null)             this.product.cout = eff.cout;

            this.submitted = false;
            this.imagePreview = null;
            this.selectedImageFile = null;
        }
    }

    // ── Data ─────────────────────────────────────────────────────────────

    private emptyProduct(): Produit {
        const p = new Produit();
        p.nom = '';
        p.type = 'materiel';
        p.statut = 'brouillon';
        p.is_global = false;
        p.is_critique = false;
        p.qte_stock = 0;
        p.in_stock = false;
        p.is_archived = false;
        p.is_low_stock = false;
        p.is_out_of_stock = false;
        p.low_stock_threshold = 0;
        return p;
    }

    // ── Getters ───────────────────────────────────────────────────────────

    get fieldsDisabled(): boolean {
        return !this.isEditing || this.loading;
    }

    get isActifSwitch(): boolean {
        return this.product.statut === 'actif';
    }

    // ── Permissions ───────────────────────────────────────────────────────

    canEditSystemDefinition(): boolean {
        if (!this.product.is_global) return true;
        return this.canManageSystemDefinition;
    }

    canToggleGlobal(): boolean {
        return this.canManageSystemDefinition && this.isEditing && !this.loading;
    }

    // ── Mode édition ──────────────────────────────────────────────────────

    enableEditing(): void {
        this.isEditing = true;
    }

    cancelEditing(): void {
        this.isEditing = false;
        this.submitted = false;
        this.imagePreview = null;
        this.selectedImageFile = null;
        if (this.initialProduit) {
            this.product = Produit.fromApi(this.initialProduit);
        }
    }

    onCancel(): void {
        this.cancel.emit();
    }

    // ── Prix : visibilité & validation ────────────────────────────────────

    isPrixAchatVisible(): boolean {
        return ['service', 'achat_vente'].includes(this.product.type);
    }

    isPrixVenteVisible(): boolean {
        return ['service', 'materiel', 'achat_vente', 'fabricable'].includes(this.product.type);
    }

    isPrixUsineVisible(): boolean {
        return ['materiel', 'achat_vente', 'fabricable'].includes(this.product.type);
    }

    isPrixAchatRequired(): boolean {
        return this.product.type === 'achat_vente';
    }

    isPrixVenteRequired(): boolean {
        return ['materiel', 'fabricable', 'achat_vente'].includes(this.product.type);
    }

    isPrixUsineRequired(): boolean {
        return ['materiel', 'fabricable', 'achat_vente'].includes(this.product.type);
    }

    isPriceMissing(value: number | null | undefined): boolean {
        return value == null;
    }

    showServicePriceError(): boolean {
        if (!this.submitted || this.product.type !== 'service') return false;
        return this.isPriceMissing(this.product.prix_achat) && this.isPriceMissing(this.product.prix_vente);
    }

    getPrixHelperText(): string {
        const map: Record<ProduitType, string> = {
            materiel: 'Prix usine et prix de vente obligatoires.',
            service: 'Au moins un prix requis : achat ou vente.',
            fabricable: 'Prix usine obligatoire.',
            achat_vente: 'Prix achat, vente et usine tous obligatoires.',
        };
        return map[this.product.type] ?? '';
    }

    // ── Seuil d'alerte stock ──────────────────────────────────────────────

    isSeuilAlerteStockVisible(): boolean {
        return this.product.type !== 'service';
    }

    isSeuilAlerteStockDisabled(): boolean {
        return this.fieldsDisabled || this.product.type === 'service';
    }

    isSeuilAlerteStockInvalid(): boolean {
        const v = this.product.seuil_alerte_stock;
        return v != null && v < 0;
    }

    getSeuilAlerteStockErrorMessage(): string {
        return 'Le seuil doit être un entier positif ou nul.';
    }

    isQteStockVisible(): boolean {
        return this.product.type !== 'service';
    }

    isQteStockDisabled(): boolean {
        if (this.product.type === 'service') return true;
        return this.fieldsDisabled;
    }

    // ── Statut toggle ─────────────────────────────────────────────────────

    onStatutToggleChange(value: boolean): void {
        this.product.statut = value ? 'actif' : 'inactif';
    }

    // ── Type change ───────────────────────────────────────────────────────

    onTypeChange(): void {
        if (!this.isPrixAchatVisible()) this.product.prix_achat = null;
        if (!this.isPrixVenteVisible()) this.product.prix_vente = null;
        if (!this.isPrixUsineVisible()) this.product.prix_usine = null;
    }

    // ── Image ─────────────────────────────────────────────────────────────

    onUpload(event: any): void {
        const file: File = event.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            this.imageError = "L'image ne doit pas dépasser 5 Mo.";
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            this.imageError = 'Format invalide. JPG, PNG ou WebP uniquement.';
            return;
        }
        this.imageError = null;
        this.selectedImageFile = file;

        const reader = new FileReader();
        reader.onload = (e) => { this.imagePreview = e.target?.result as string; };
        reader.readAsDataURL(file);

        if (this.mode === 'edit') {
            this.uploadImage.emit(file);
        }
    }

    removeImage(event: Event): void {
        event.stopPropagation();
        if (this.selectedImageFile || !this.product.image_url) {
            this.imagePreview = null;
            this.selectedImageFile = null;
            return;
        }
        this.confirmingDelete = true;
    }

    confirmDeleteImage(event: Event): void {
        event.stopPropagation();
        if (!this.product.id) {
            this.imagePreview = null;
            this.selectedImageFile = null;
            this.confirmingDelete = false;
            return;
        }
        this.confirmingDelete = false;
        this.deleteImage.emit();
    }

    cancelDeleteImage(event: Event): void {
        event.stopPropagation();
        this.confirmingDelete = false;
    }

    // ── Validation ────────────────────────────────────────────────────────

    isValid(): boolean {
        if (!this.product.nom?.trim()) return false;
        if (this.product.type === 'service') {
            return !this.isPriceMissing(this.product.prix_achat) || !this.isPriceMissing(this.product.prix_vente);
        }
        if (this.isPrixUsineRequired() && this.isPriceMissing(this.product.prix_usine)) return false;
        if (this.isPrixVenteRequired() && this.isPriceMissing(this.product.prix_vente)) return false;
        if (this.isPrixAchatRequired() && this.isPriceMissing(this.product.prix_achat)) return false;
        return true;
    }

    // ── Submit ────────────────────────────────────────────────────────────

    onSubmit(): void {
        this.submitted = true;
        if (!this.isValid()) return;

        const toInt = (v: number | null | undefined): number | undefined =>
            v != null ? Math.round(v) : undefined;

        const dto: CreateProduitDto = {
            nom: this.product.nom,
            type: this.product.type,
            statut: this.product.statut as ProduitStatut,
            code_interne: this.product.code_interne ?? undefined,
            code_fournisseur: this.product.code_fournisseur ?? undefined,
            prix_usine: toInt(this.product.prix_usine),
            prix_vente: toInt(this.product.prix_vente),
            prix_achat: toInt(this.product.prix_achat),
            cout: toInt(this.product.cout) ?? 0,
            seuil_alerte_stock: this.product.seuil_alerte_stock != null
                ? Math.round(this.product.seuil_alerte_stock)
                : null,
            description: this.product.description ?? undefined,
            is_global: this.product.is_global ?? false,
            is_critique: this.product.is_critique ?? false,
            qte_stock: Math.round(this.product.qte_stock ?? 0),
            ...(this.mode === 'create' && this.selectedImageFile ? { image: this.selectedImageFile } : {}),
        };

        this.submitForm.emit(dto);
         console.log(dto);
    }

   
    
}
