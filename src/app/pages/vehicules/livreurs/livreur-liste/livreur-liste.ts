import { Component, OnInit, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { Menu, MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { Livreur } from '@/models/vehicule.model';
import { LivreurService } from '@/services/livreurs/livreur.service';
import { PhoneFormatPipe } from '@/app/pipes/phone-format.pipe';

type StatusSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

interface LivreurRow extends Livreur {
    name: string;
    status: 'Actif' | 'Inactif';
    role: string;
    department: string;
    joinDate: string;
    authorizationLevel: string;
}

@Component({
    selector: 'app-livreur-liste',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
        DialogModule,
        SelectModule,
        MenuModule,
        ConfirmDialogModule,
        PhoneFormatPipe
    ],
    providers: [ConfirmationService],
    templateUrl: './livreur-liste.html',
    styleUrl: './livreur-liste.scss'
})
export class LivreurListe implements OnInit {
    @ViewChild('actionMenu') actionMenu!: Menu;

    users = signal<LivreurRow[]>([]);

    selectedUsers: LivreurRow[] = [];
    searchValue = '';
    first = 0;
    rows = 8;
    selectedUserId = signal<number | null>(null);

    menuItems = computed<MenuItem[]>(() => {
        const userId = this.selectedUserId();
        if (!userId) return [];

        const user = this.users().find((item) => item.id === userId);
        if (!user) return [];

        return [
            {
                label: 'Modifier',
                icon: 'pi pi-pencil',
                command: () => this.goEdit(user)
            },
            {
                label: 'Supprimer',
                icon: 'pi pi-trash',
                command: () => this.confirmDelete(user)
            }
        ];
    });

    // Conserves pour ne pas casser le HTML existant (dialog).
    editDialogVisible = false;
    editForm = {
        name: '',
        role: '',
        department: '',
        joinDate: '',
        authorizationLevel: '',
        status: ''
    };

    roleOptions = ['Admin', 'Manager', 'Employee'];
    departmentOptions = ['Sales', 'HR', 'Marketing'];
    authorizationLevelOptions = ['Full Access', 'Viewing Only', 'Restricted'];
    statusOptions = ['Actif', 'Inactif'];

    constructor(
        private router: Router,
        private confirmationService: ConfirmationService,
        private livreurService: LivreurService
    ) {}

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.livreurService.getAll().subscribe({
            next: (resp) => {
                const rows = (resp.data?.data ?? []).map((livreur) => this.toRow(livreur));
                this.users.set(rows);
            },
            error: () => {
                this.users.set([]);
            }
        });
    }

    toggleMenu(event: Event, userId: number): void {
        this.selectedUserId.set(userId);
        this.actionMenu.toggle(event);
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getStatusSeverity(status: string): StatusSeverity {
        return status === 'Actif' ? 'success' : 'danger';
    }

    getInitials(name: string): string {
        const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
        if (!words.length) {
            return '--';
        }
        if (words.length === 1) {
            return words[0].slice(0, 2).toUpperCase();
        }
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    formatDate(date: string | null | undefined): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    }

    addNewUser(): void {
        this.router.navigate(['/vehicules/livreurs/new']);
    }

    goEdit(user: LivreurRow): void {
        this.router.navigate(['/vehicules/livreurs/edit', user.id]);
    }

    confirmDelete(user: LivreurRow): void {
        this.confirmationService.confirm({
            message: `Supprimer ${user.name} ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Annuler',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Supprimer',
                severity: 'danger'
            },
            accept: () => {
                this.livreurService.delete(user.id).subscribe({
                    next: () => {
                        this.users.update((list) => list.filter((item) => item.id !== user.id));
                    }
                });
            }
        });
    }

    // Méthodes conservées pour le dialog du template existant.
    saveUser(): void {
        this.editDialogVisible = false;
    }

    closeEditDialog(): void {
        this.editDialogVisible = false;
    }

    private toRow(livreur: Livreur): LivreurRow {
        const status = this.isLivreurActive(livreur) ? 'Actif' : 'Inactif';
        return {
            ...livreur,
            name: `${livreur.prenom} ${livreur.nom}`.trim(),
            status,
            role: '',
            department: '',
            joinDate: livreur.created_at ?? '',
            authorizationLevel: ''
        };
    }

    private isLivreurActive(livreur: Livreur): boolean {
        const value = (livreur as { is_active: unknown }).is_active;
        return value === true || value === 1 || value === '1';
    }

    // Compatibilité avec d'anciens appels potentiels.
    deleteUser(userId: number): void {
        const user = this.users().find((item) => item.id === userId);
        if (!user) {
            return;
        }
        this.confirmDelete(user);
    }
}
