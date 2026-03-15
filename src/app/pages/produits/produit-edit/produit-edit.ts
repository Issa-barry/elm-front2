import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProduitService } from '@/services/produits/produits.service';
import { CreateProduitDto, Produit } from '@/models/produit.model';
import { ProduitForm } from '../produit-form/produit-form';

@Component({
    selector: 'app-produit-edit',
    standalone: true,
    imports: [CommonModule, ProduitForm, ToastModule],
    providers: [MessageService],
    templateUrl: './produit-edit.html',
    styleUrl: './produit-edit.scss',
})
export class ProduitEdit implements OnInit, OnDestroy {
    loading = false;
    produit: Produit | null = null;
    produitId: number | null = null;

    private cdr = inject(ChangeDetectorRef);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private produitService: ProduitService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.produitId = +id;
            this.loadProduit(+id);
        } else {
            this.router.navigate(['/produits']);
        }
        this.updateMobilePwaMode();
    }

    ngOnDestroy(): void {
        document.body.classList.remove('produits-mobile-pwa');
    }

    @HostListener('window:resize')
    onResize(): void {
        this.updateMobilePwaMode();
    }

    private updateMobilePwaMode(): void {
        if (window.innerWidth <= 768) {
            document.body.classList.add('produits-mobile-pwa');
        } else {
            document.body.classList.remove('produits-mobile-pwa');
        }
    }

    private loadProduit(id: number): void {
        this.loading = true;
        this.cdr.markForCheck();
        this.produitService.getById(id).subscribe({
            next: (p) => {
                this.produit = p;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.loading = false;
                this.cdr.markForCheck();
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Produit introuvable.' });
                this.router.navigate(['/produits']);
            },
        });
    }

    onSubmitForm(dto: CreateProduitDto): void {
        if (!this.produitId) return;
        this.loading = true;
        this.cdr.markForCheck();
        this.produitService.update(this.produitId, dto).subscribe({
            next: (p) => {
                this.produit = p;
                this.loading = false;
                this.cdr.markForCheck();
                this.messageService.add({ severity: 'success', summary: 'Modifié', detail: 'Produit mis à jour.' });
            },
            error: (err) => this.handleError('Erreur lors de la mise à jour', err),
        });
    }

    onUploadImage(file: File): void {
        if (!this.produitId) return;
        this.loading = true;
        this.cdr.markForCheck();
        this.produitService.uploadProduitImage(this.produitId, file).subscribe({
            next: (p) => {
                this.produit = p;
                this.loading = false;
                this.cdr.markForCheck();
                this.messageService.add({ severity: 'success', summary: 'Image mise à jour', detail: "L'image a été enregistrée." });
            },
            error: () => {
                this.loading = false;
                this.cdr.markForCheck();
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'upload." });
            },
        });
    }

    onDeleteImage(): void {
        if (!this.produitId) return;
        this.loading = true;
        this.cdr.markForCheck();
        this.produitService.deleteProduitImage(this.produitId).subscribe({
            next: (p) => {
                this.produit = p;
                this.loading = false;
                this.cdr.markForCheck();
                this.messageService.add({ severity: 'info', summary: 'Image supprimée', detail: "L'image a été supprimée." });
            },
            error: () => {
                this.loading = false;
                this.cdr.markForCheck();
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de la suppression." });
            },
        });
    }

    private handleError(fallback: string, err?: any): void {
        if (err?.status === 422 && err?.error?.errors) {
            Object.values(err.error.errors)
                .flat()
                .forEach((msg) =>
                    this.messageService.add({ severity: 'error', summary: fallback, detail: msg as string, life: 5000 }),
                );
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: err?.error?.message || fallback,
            });
        }
        this.loading = false;
        this.cdr.markForCheck();
    }

    onCancel(): void {
        this.router.navigate(['/produits']);
    }
}
