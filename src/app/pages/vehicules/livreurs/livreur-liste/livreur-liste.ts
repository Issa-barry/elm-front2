import { Component, computed, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
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

interface User {
    id: number;
    name: string;
    avatar: string;
    role: string;
    department: string;
    joinDate: string;
    authorizationLevel: string;
    status: string;
} 

@Component({
  selector: 'app-livreur-liste',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, DialogModule, SelectModule, MenuModule, ConfirmDialogModule],
    providers: [ConfirmationService],
  templateUrl: './livreur-liste.html',
  styleUrl: './livreur-liste.scss',
})
export class LivreurListe {
    @ViewChild('dt') dt!: Table;
    @ViewChild('actionMenu') actionMenu!: Menu;

    users = signal<User[]>([
        {
            id: 1,
            name: 'Brook Simmons',
            avatar: '/demo/images/avatar/avatar-f-3.png',
            role: 'Admin',
            department: 'Sales',
            joinDate: 'Feb 5th, 2025',
            authorizationLevel: 'Full Access',
            status: 'Active'
        },
        {
            id: 2,
            name: 'Dianne Russell',
            avatar: '/demo/images/avatar/avatar-f-5.png',
            role: 'Manager',
            department: 'HR',
            joinDate: 'Feb 24th, 2025',
            authorizationLevel: 'Viewing Only',
            status: 'Deactive'
        },
        {
            id: 3,
            name: 'Amy Elsner',
            avatar: '/demo/images/avatar/amyelsner.png',
            role: 'Admin',
            department: 'Marketing',
            joinDate: 'Feb 24th, 2025',
            authorizationLevel: 'Restricted',
            status: 'Active'
        },
        {
            id: 4,
            name: 'Guy Hawkins',
            avatar: '/demo/images/avatar/avatar-m-2.png',
            role: 'Admin',
            department: 'Marketing',
            joinDate: 'Jan 28th, 2025',
            authorizationLevel: 'Restricted',
            status: 'Active'
        },
        {
            id: 5,
            name: 'Darrell Steward',
            avatar: '/demo/images/avatar/avatar-m-4.png',
            role: 'Employee',
            department: 'Sales',
            joinDate: 'Jan 21th, 2025',
            authorizationLevel: 'Viewing Only',
            status: 'Deactive'
        },
        {
            id: 6,
            name: 'Onyama Limba',
            avatar: '/demo/images/avatar/onyamalimba.png',
            role: 'Manager',
            department: 'HR',
            joinDate: 'Jan 21th, 2025',
            authorizationLevel: 'Full Access',
            status: 'Deactive'
        },
        {
            id: 7,
            name: 'Arlene McCoy',
            avatar: '/demo/images/avatar/avatar-f-7.png',
            role: 'Manager',
            department: 'HR',
            joinDate: 'Jan 21th, 2025',
            authorizationLevel: 'Full Access',
            status: 'Deactive'
        },
        {
            id: 8,
            name: 'Annette Black',
            avatar: '/demo/images/avatar/annafali.png',
            role: 'Employee',
            department: 'Marketing',
            joinDate: 'Jan 28th, 2025',
            authorizationLevel: 'Full Access',
            status: 'Active'
        }
    ]);

    selectedUsers: User[] = [];
    searchValue = '';
    first = 0;
    rows = 8;
    selectedUserId = signal<number | null>(null);

    menuItems = computed(() => {
        const userId = this.selectedUserId();
        if (!userId) return [];
        return [
            {
                label: 'Edit',
                icon: 'pi pi-pencil',
                command: () => this.openEditDialog(userId)
            },
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => this.confirmDelete(userId)
            }
        ];
    });

    editDialogVisible = false;
    editingUser: User | null = null;
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
    statusOptions = ['Active', 'Deactive'];

    constructor(
        private router: Router,
        private confirmationService: ConfirmationService
    ) {}

    toggleMenu(event: Event, userId: number) {
        this.selectedUserId.set(userId);
        this.actionMenu.toggle(event);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        return status === 'Active' ? 'success' : 'danger';
    }

    openEditDialog(userId: number) {
        const user = this.users().find((u) => u.id === userId);
        if (user) {
            this.editingUser = user;
            this.editForm = {
                name: user.name,
                role: user.role,
                department: user.department,
                joinDate: user.joinDate,
                authorizationLevel: user.authorizationLevel,
                status: user.status
            };
            this.editDialogVisible = true;
        }
    }

    saveUser() {
        if (this.editingUser) {
            const users = this.users();
            const index = users.findIndex((u) => u.id === this.editingUser!.id);
            if (index !== -1) {
                users[index] = {
                    ...users[index],
                    name: this.editForm.name,
                    role: this.editForm.role,
                    department: this.editForm.department,
                    joinDate: this.editForm.joinDate,
                    authorizationLevel: this.editForm.authorizationLevel,
                    status: this.editForm.status
                };
                this.users.set([...users]);
            }
            this.editDialogVisible = false;
            this.editingUser = null;
        }
    }

    closeEditDialog() {
        this.editDialogVisible = false;
        this.editingUser = null;
    }

    addNewUser() {
        this.router.navigate(['/profile/create/basic-information']);
    }

    confirmDelete(userId: number) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this user?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Delete',
                severity: 'danger'
            },
            accept: () => {
                this.deleteUser(userId);
            }
        });
    }

    deleteUser(userId: number) {
        this.users.set(this.users().filter((u) => u.id !== userId));
    }
}
