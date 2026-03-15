import { Component, HostListener, Inject, OnDestroy, OnInit, ViewChild, computed, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { Menu, MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

import { ProduitService } from '@/services/produits/produits.service';
import { ChangeStatusDto, Produit, ProduitStatut, ProduitType } from '@/models/produit.model';

@Component({
    selector: 'app-produit-liste',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
        SelectModule,
        MenuModule,
        ConfirmDialogModule,
        ToastModule,
        TooltipModule,
        SkeletonModule,
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './produit-liste.html',
    styleUrl: './produit-liste.scss',
})
export class ProduitListe implements OnInit, OnDestroy {
    @ViewChild('dt') dt!: Table;
    @ViewChild('actionMenu') actionMenu!: Menu;

    produits = signal<Produit[]>([]);
    loading = signal(false);

    searchValue = '';
    mobileSearchValue = '';
    first = 0;
    rows = 10;

    filterType: ProduitType | null = null;
    filterStatut: ProduitStatut | null = null;

    isMobileView = false;
    private readonly mobileBreakpoint = 768;
    private readonly mobilePwaClass = 'produits-mobile-pwa';

    selectedProduitId = signal<number | null>(null);

    menuItems = computed(() => {
        const id = this.selectedProduitId();
        if (!id) return [];
        const p = this.produits().find((x) => x.id === id);
        if (!p) return [];

        const items: MenuItem[] = [
            { label: 'Modifier', icon: 'pi pi-pencil', command: () => this.router.navigate(['/produits/edit', id]) },
        ];

        if (p.statut === 'archive') {
            items.push({ label: 'Desarchiver', icon: 'pi pi-undo', command: () => this.confirmUnarchive(id) });
        } else {
            if (p.statut === 'brouillon' || p.statut === 'inactif') {
                items.push({ label: 'Activer', icon: 'pi pi-check-circle', command: () => this.changerStatut(id, 'actif') });
            }
            if (p.statut === 'actif') {
                items.push({ label: 'Desactiver', icon: 'pi pi-ban', command: () => this.changerStatut(id, 'inactif') });
            }
            items.push({ label: 'Archiver', icon: 'pi pi-inbox', command: () => this.confirmArchive(id) });
        }

        items.push({ separator: true });
        items.push({ label: 'Supprimer', icon: 'pi pi-trash', command: () => this.confirmDelete(id) });

        return items;
    });

    mobileFilterMenuItems: MenuItem[] = [];

    typeOptions = [
        { label: 'Tous les types', value: null },
        { label: 'Materiel', value: 'materiel' },
        { label: 'Service', value: 'service' },
        { label: 'Fabricable', value: 'fabricable' },
        { label: 'Achat / Vente', value: 'achat_vente' },
    ];

    statutOptions = [
        { label: 'Tous les statuts', value: null },
        { label: 'Brouillon', value: 'brouillon' },
        { label: 'Actif', value: 'actif' },
        { label: 'Inactif', value: 'inactif' },
        { label: 'Archive', value: 'archive' },
    ];

    constructor(
        public router: Router,
        private produitService: ProduitService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        @Inject(DOCUMENT) private document: Document,
    ) {}

    ngOnInit(): void {
        this.syncMobileMode();
        this.buildMobileFilterMenuItems();
        this.loadProduits();
    }

    ngOnDestroy(): void {
        this.document.body.classList.remove(this.mobilePwaClass);
    }

    @HostListener('window:resize')
    onWindowResize(): void {
        this.syncMobileMode();
    }

    loadProduits(): void {
        this.loading.set(true);
        this.produitService
            .getAllFiltered({
                type: this.filterType ?? undefined,
                statut: this.filterStatut ?? undefined,
            })
            .subscribe({
                next: (produits) => {
                    this.produits.set(produits);
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les produits.' });
                },
            });
    }

    onFilterChange(): void {
        this.first = 0;
        this.loadProduits();
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    get mobileFilteredProduits(): Produit[] {
        const term = this.mobileSearchValue.trim().toLowerCase();
        if (!term) return this.produits();

        return this.produits().filter((produit) => {
            const nom = (produit.nom ?? '').toLowerCase();
            const codeInterne = (produit.code_interne ?? '').toLowerCase();
            const codeFournisseur = (produit.code_fournisseur ?? '').toLowerCase();
            const type = this.getTypeLabel(produit.type).toLowerCase();
            const statut = this.getStatutLabel(produit.statut).toLowerCase();

            return (
                nom.includes(term) ||
                codeInterne.includes(term) ||
                codeFournisseur.includes(term) ||
                type.includes(term) ||
                statut.includes(term)
            );
        });
    }

    goBack(): void {
        this.router.navigate(['/']);
    }

    goNew(): void {
        this.router.navigate(['/produits/new']);
    }

    applyMobileTypeFilter(type: ProduitType | null): void {
        this.filterType = type;
        this.onFilterChange();
    }

    applyMobileStatutFilter(statut: ProduitStatut | null): void {
        this.filterStatut = statut;
        this.onFilterChange();
    }

    clearMobileFilters(): void {
        this.filterType = null;
        this.filterStatut = null;
        this.onFilterChange();
    }

    toggleMenu(event: Event, id: number): void {
        this.selectedProduitId.set(id);
        this.actionMenu.toggle(event);
    }

    confirmDelete(id: number): void {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment supprimer ce produit ? Cette action est irreversible.',
            header: 'Confirmer la suppression',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Supprimer', severity: 'danger' },
            accept: () => this.deleteProduit(id),
        });
    }

    deleteProduit(id: number): void {
        this.produitService.delete(id).subscribe({
            next: () => {
                this.produits.update((list) => list.filter((p) => p.id !== id));
                this.messageService.add({ severity: 'success', summary: 'Supprime', detail: 'Produit supprime.' });
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression impossible.' });
            },
        });
    }

    confirmArchive(id: number): void {
        this.confirmationService.confirm({
            message: 'Archiver ce produit ?',
            header: 'Archiver',
            icon: 'pi pi-inbox',
            rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Archiver' },
            accept: () => {
                this.produitService.archive(id).subscribe({
                    next: (p) => {
                        this.produits.update((list) => list.map((x) => (x.id === p.id ? p : x)));
                        this.messageService.add({ severity: 'info', summary: 'Archive', detail: 'Produit archive.' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Archivage impossible.' }),
                });
            },
        });
    }

    confirmUnarchive(id: number): void {
        this.confirmationService.confirm({
            message: 'Desarchiver ce produit ?',
            header: 'Desarchiver',
            icon: 'pi pi-undo',
            rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Desarchiver' },
            accept: () => {
                this.produitService.unarchive(id).subscribe({
                    next: (p) => {
                        this.produits.update((list) => list.map((x) => (x.id === p.id ? p : x)));
                        this.messageService.add({ severity: 'success', summary: 'Desarchive', detail: 'Produit desarchive.' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Desarchivage impossible.' }),
                });
            },
        });
    }

    changerStatut(id: number, statut: ProduitStatut): void {
        const dto: ChangeStatusDto = { statut };
        this.produitService.changeStatus(id, dto).subscribe({
            next: (p) => {
                this.produits.update((list) => list.map((x) => (x.id === p.id ? p : x)));
                const labels: Record<ProduitStatut, string> = { actif: 'active', inactif: 'desactive', brouillon: 'mis en brouillon', archive: 'archive' };
                this.messageService.add({ severity: 'success', summary: 'Statut mis a jour', detail: `Produit ${labels[statut]}.` });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Changement de statut impossible.' }),
        });
    }

    getStatutSeverity(statut: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        const map: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger'> = {
            actif: 'success',
            inactif: 'secondary',
            brouillon: 'warn',
            archive: 'danger',
        };
        return map[statut];
    }

    getStatutLabel(statut: string): string {
        const map: Record<string, string> = { actif: 'Actif', inactif: 'Inactif', brouillon: 'Brouillon', archive: 'Archive' };
        return map[statut] ?? statut;
    }

    getTypeLabel(type: string): string {
        const map: Record<string, string> = { materiel: 'Materiel', service: 'Service', fabricable: 'Fabricable', achat_vente: 'Achat/Vente' };
        return map[type] ?? type;
    }

    getTypeSeverity(type: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        const map: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
            materiel: 'info',
            service: 'contrast',
            fabricable: 'warn',
            achat_vente: 'secondary',
        };
        return map[type];
    }

    formatPrice(price: number | null | undefined): string {
        if (price == null) return '-';
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(price) + ' GNF';
    }

    private syncMobileMode(): void {
        if (typeof window === 'undefined') {
            this.isMobileView = false;
            return;
        }

        this.isMobileView = window.innerWidth <= this.mobileBreakpoint;
        if (this.isMobileView) {
            this.document.body.classList.add(this.mobilePwaClass);
        } else {
            this.document.body.classList.remove(this.mobilePwaClass);
        }
    }

    private buildMobileFilterMenuItems(): void {
        this.mobileFilterMenuItems = [
            { label: 'Tous les filtres', icon: 'pi pi-filter-slash', command: () => this.clearMobileFilters() },
            { separator: true },
            {
                label: 'Types',
                items: [
                    { label: 'Tous les types', command: () => this.applyMobileTypeFilter(null) },
                    { label: 'Materiel', command: () => this.applyMobileTypeFilter('materiel') },
                    { label: 'Service', command: () => this.applyMobileTypeFilter('service') },
                    { label: 'Fabricable', command: () => this.applyMobileTypeFilter('fabricable') },
                    { label: 'Achat / Vente', command: () => this.applyMobileTypeFilter('achat_vente') },
                ],
            },
            { separator: true },
            {
                label: 'Statuts',
                items: [
                    { label: 'Tous les statuts', command: () => this.applyMobileStatutFilter(null) },
                    { label: 'Brouillon', command: () => this.applyMobileStatutFilter('brouillon') },
                    { label: 'Actif', command: () => this.applyMobileStatutFilter('actif') },
                    { label: 'Inactif', command: () => this.applyMobileStatutFilter('inactif') },
                    { label: 'Archive', command: () => this.applyMobileStatutFilter('archive') },
                ],
            },
        ];
    }
}
