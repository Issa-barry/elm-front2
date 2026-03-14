import { Injectable, computed, signal } from '@angular/core';
import { MeResponse } from '@/models/usine.model';

export interface UsineInfo {
    id: number;
    name?: string;
    type?: string;
    is_default?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsineContextService {
    // Usines accessibles à l'utilisateur
    accessibleUsines = signal<UsineInfo[]>([]);

    // Usine courante sélectionnée (null = toutes / siège)
    currentUsineId  = signal<number | null>(null);

    // Usine par défaut
    defaultUsineId  = signal<number | null>(null);

    // Si l'utilisateur est de type siège
    isSiegeUser = signal<boolean>(false);

    /** Valeur à envoyer dans l'en-tête X-Site-Id */
    headerUsineId = computed<number | string | null>(() => {
        const current = this.currentUsineId();
        if (current !== null) return current;
        if (this.isSiegeUser()) return 'all';
        return this.defaultUsineId();
    });

    hydrateFromMe(data: MeResponse): void {
        // Extraire les sites/usines du payload /auth/me
        const sites: UsineInfo[] = data['sites'] ?? data['usines'] ?? [];
        if (sites.length > 0) {
            this.accessibleUsines.set(sites);
        }

        const defaultSite = sites.find(s => s.is_default) ?? sites[0] ?? null;
        if (defaultSite) {
            this.defaultUsineId.set(defaultSite.id);
        }

        // Déterminer si siège via type ou champ dédié
        const isSiege: boolean = data['is_siege'] ?? data['isSiege'] ?? false;
        this.isSiegeUser.set(isSiege);
    }

    setCurrentUsine(id: number | null): void {
        this.currentUsineId.set(id);
    }

    fallbackToDefault(): void {
        this.currentUsineId.set(this.defaultUsineId());
    }

    clear(): void {
        this.accessibleUsines.set([]);
        this.currentUsineId.set(null);
        this.defaultUsineId.set(null);
        this.isSiegeUser.set(false);
    }
}
