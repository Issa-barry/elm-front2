import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '@/services/auth/auth.service';
import { User } from '@/models/user.model';

const MODULE_ALIASES: Record<string, string> = {
    produit: 'produit', produits: 'produit', product: 'produit', products: 'produit',
    packing: 'packing', packings: 'packing',
    prestataire: 'prestataire', prestataires: 'prestataire',
    utilisateur: 'utilisateur', utilisateurs: 'utilisateur', user: 'utilisateur', users: 'utilisateur',
    role: 'role', roles: 'role',
    commande: 'commande', commandes: 'commande',
    encaissement: 'encaissement', encaissements: 'encaissement',
    site: 'site', sites: 'site',
    organisation: 'organisation', organisations: 'organisation',
};

function normalizeRole(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeModule(value: string): string {
    const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, '');
    if (!compact) return '';
    if (MODULE_ALIASES[compact]) return MODULE_ALIASES[compact];
    if (compact.endsWith('s') && compact.length > 1) {
        const singular = compact.slice(0, -1);
        return MODULE_ALIASES[singular] ?? singular;
    }
    return compact;
}

function normalizePermission(value: string): string {
    const raw = value.trim().toLowerCase();
    if (!raw) return '';
    const lastDot = raw.lastIndexOf('.');
    if (lastDot < 0) return normalizeModule(raw);
    return `${normalizeModule(raw.slice(0, lastDot))}.${raw.slice(lastDot + 1).replace(/[\s_-]+/g, '')}`;
}

function userRoles(user: User): string[] {
    return [...(user.roles ?? []), ...(user.role_names ?? [])]
        .map(r => normalizeRole(r))
        .filter(r => r.length > 0);
}

export const authorizationGuard: CanActivateFn = (route): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router      = inject(Router);

    const user = authService.currentUser();
    if (!user) return router.createUrlTree(['/auth/login']);

    const requiredRoles       = route.data?.['roles'] as string[] | undefined;
    const requiredPermissions = route.data?.['permissions'] as string[] | undefined;

    const roles        = userRoles(user);
    const isSuperAdmin = roles.includes('superadmin');
    const permissions  = user.permissions ?? [];

    const hasRole = !requiredRoles?.length ||
        requiredRoles.some(r => roles.includes(normalizeRole(r)));

    const hasPermission = !requiredPermissions?.length || isSuperAdmin ||
        (() => {
            const current = new Set(permissions.map(p => normalizePermission(p)).filter(p => p.length > 0));
            return requiredPermissions.some(p => current.has(normalizePermission(p)));
        })();

    return hasRole && hasPermission ? true : router.createUrlTree(['/']);
};
