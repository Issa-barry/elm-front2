import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@/services/auth/auth.service';

@Component({
    standalone: true,
    selector: 'app-header-widget',
    imports: [ButtonModule, TooltipModule],
    template: `
        <div class="flex flex-col sm:flex-row items-center gap-6"> 
            <div class="flex flex-col sm:flex-row items-center gap-4">
                <div class="w-16 h-16 shrink-0 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl select-none">
                    {{ initials() }}
                </div>
                <div class="flex flex-col items-center sm:items-start">
                    <span class="text-surface-900 dark:text-surface-0 font-bold text-4xl"> {{ fullName() }}</span>
                    <p class="text-surface-600 dark:text-surface-200 m-0">{{ role() }}</p>
                </div>
            </div>
            <div class="flex items-center gap-2 sm:ml-auto flex-wrap">
                <p-button pTooltip="Withdraw" tooltipPosition="bottom" icon="pi pi-download" outlined rounded></p-button>
                <p-button pTooltip="Send" tooltipPosition="bottom" icon="pi pi-send" rounded></p-button>
                <ng-content></ng-content>
            </div>
        </div>
    `
})
export class HeaderWidget {
    private authService = inject(AuthService);

    role = computed(() => {
        const user = this.authService.currentUser();
        return user?.role_names?.[0] ?? user?.roles?.[0] ?? '';
    });

    fullName = computed(() => {
        const user = this.authService.currentUser();
        if (!user) return '';
        return user.nom_complet || [user.prenom, user.nom].filter(Boolean).join(' ');
    });

    initials = computed(() => {
        const user = this.authService.currentUser();
        if (!user) return '';
        return [(user.prenom ?? '')[0], (user.nom ?? '')[0]].filter(Boolean).join('').toUpperCase();
    });
}
