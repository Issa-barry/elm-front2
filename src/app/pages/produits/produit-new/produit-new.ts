import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProduitService } from '@/services/produits/produits.service';
import { CreateProduitDto, Produit } from '@/models/produit.model';
import { ProduitForm } from '../produit-form/produit-form';

@Component({
    selector: 'app-produit-new',
    standalone: true,
    imports: [CommonModule, ProduitForm, ToastModule],
    providers: [MessageService],
    templateUrl: './produit-new.html',
    styleUrl: './produit-new.scss',
})
export class ProduitNew implements OnInit, OnDestroy {
    loading = false;

    constructor(
        private router: Router,
        private produitService: ProduitService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
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

    onSubmitForm(dto: CreateProduitDto): void {
        this.loading = true;
        this.produitService.create(dto).subscribe({
            next: (prod) => {
                if (dto.image) {
                    this.uploadImageAfterCreate(prod, dto.image);
                } else {
                    this.handleSuccess(prod);
                }
            },
            error: (err) => this.handleError('Erreur lors de la création du produit', err),
        });
    }

    private uploadImageAfterCreate(prod: Produit, image: File): void {
        this.produitService.uploadProduitImage(prod.id, image).subscribe({
            next: () => this.handleSuccess(prod),
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Produit créé',
                    detail: "Produit créé, mais l'image n'a pas pu être uploadée.",
                    life: 5000,
                });
                this.router.navigate(['/produits']);
            },
        });
    }

    private handleSuccess(prod: Produit): void {
        this.loading = false;
        this.messageService.add({
            severity: 'success',
            summary: 'Créé',
            detail: 'Produit créé avec succès.',
        });
        this.router.navigate(['/produits']);
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
    }

    onCancel(): void {
        this.router.navigate(['/produits']);
    }
}
