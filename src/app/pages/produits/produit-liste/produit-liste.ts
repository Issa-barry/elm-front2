import { Component, OnInit, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
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
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './produit-liste.html',
    styleUrl: './produit-liste.scss',
})
export class ProduitListe implements OnInit {
    @ViewChild('dt') dt!: Table;
    @ViewChild('actionMenu') actionMenu!: Menu;

    produits = signal<Produit[]>([]);
    loading = signal(false);

    searchValue = '';
    first = 0;
    rows = 10;

    filterType: ProduitType | null = null;
    filterStatut: ProduitStatut | null = null;

    selectedProduitId = signal<number | null>(null);

    menuItems = computed(() => {
        const id = this.selectedProduitId();
        if (!id) return [];
        const p = this.produits().find((x) => x.id === id);
        if (!p) return [];

        const items: any[] = [
            { label: 'Modifier', icon: 'pi pi-pencil', command: () => this.router.navigate(['/produits/edit', id]) },
        ];

        if (p.statut === 'archive') {
            items.push({ label: 'Désarchiver', icon: 'pi pi-undo', command: () => this.confirmUnarchive(id) });
        } else {
            if (p.statut === 'brouillon' || p.statut === 'inactif') {
                items.push({ label: 'Activer', icon: 'pi pi-check-circle', command: () => this.changerStatut(id, 'actif') });
            }
            if (p.statut === 'actif') {
                items.push({ label: 'Désactiver', icon: 'pi pi-ban', command: () => this.changerStatut(id, 'inactif') });
            }
            items.push({ label: 'Archiver', icon: 'pi pi-inbox', command: () => this.confirmArchive(id) });
        }

        items.push({ separator: true });
        items.push({ label: 'Supprimer', icon: 'pi pi-trash', command: () => this.confirmDelete(id) });

        return items;
    });

    typeOptions = [
        { label: 'Tous les types', value: null },
        { label: 'Matériel', value: 'materiel' },
        { label: 'Service', value: 'service' },
        { label: 'Fabricable', value: 'fabricable' },
        { label: 'Achat / Vente', value: 'achat_vente' },
    ];

    statutOptions = [
        { label: 'Tous les statuts', value: null },
        { label: 'Brouillon', value: 'brouillon' },
        { label: 'Actif', value: 'actif' },
        { label: 'Inactif', value: 'inactif' },
        { label: 'Archivé', value: 'archive' },
    ];

    constructor(
        private router: Router,
        private produitService: ProduitService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.loadProduits();
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

    toggleMenu(event: Event, id: number): void {
        this.selectedProduitId.set(id);
        this.actionMenu.toggle(event);
    }

    confirmDelete(id: number): void {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.',
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
                this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: 'Produit supprimé.' });
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
                        this.messageService.add({ severity: 'info', summary: 'Archivé', detail: 'Produit archivé.' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Archivage impossible.' }),
                });
            },
        });
    }

    confirmUnarchive(id: number): void {
        this.confirmationService.confirm({
            message: 'Désarchiver ce produit ?',
            header: 'Désarchiver',
            icon: 'pi pi-undo',
            rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Désarchiver' },
            accept: () => {
                this.produitService.unarchive(id).subscribe({
                    next: (p) => {
                        this.produits.update((list) => list.map((x) => (x.id === p.id ? p : x)));
                        this.messageService.add({ severity: 'success', summary: 'Désarchivé', detail: 'Produit désarchivé.' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Désarchivage impossible.' }),
                });
            },
        });
    }

    changerStatut(id: number, statut: ProduitStatut): void {
        const dto: ChangeStatusDto = { statut };
        this.produitService.changeStatus(id, dto).subscribe({
            next: (p) => {
                this.produits.update((list) => list.map((x) => (x.id === p.id ? p : x)));
                const labels: Record<ProduitStatut, string> = { actif: 'activé', inactif: 'désactivé', brouillon: 'mis en brouillon', archive: 'archivé' };
                this.messageService.add({ severity: 'success', summary: 'Statut mis à jour', detail: `Produit ${labels[statut]}.` });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Changement de statut impossible.' }),
        });
    }

    getStatutSeverity(statut: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        const map: Record<string, any> = { actif: 'success', inactif: 'secondary', brouillon: 'warn', archive: 'danger' };
        return map[statut];
    }

    getStatutLabel(statut: string): string {
        const map: Record<string, string> = { actif: 'Actif', inactif: 'Inactif', brouillon: 'Brouillon', archive: 'Archivé' };
        return map[statut] ?? statut;
    }

    getTypeLabel(type: string): string {
        const map: Record<string, string> = { materiel: 'Matériel', service: 'Service', fabricable: 'Fabricable', achat_vente: 'Achat/Vente' };
        return map[type] ?? type;
    }

    getTypeSeverity(type: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        const map: Record<string, any> = { materiel: 'info', service: 'contrast', fabricable: 'warn', achat_vente: 'secondary' };
        return map[type];
    }

    formatPrice(price: number | null | undefined): string {
        if (price == null) return '—';
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(price) + ' GNF';
    }
}
