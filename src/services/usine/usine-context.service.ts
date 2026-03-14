import { Injectable, computed, signal } from '@angular/core';
import { AccessibleUsine, MeResponse } from '@/models/usine.model';

const STORAGE_KEY = 'site_context';
const LEGACY_STORAGE_KEY = 'usine_context';

interface PersistedUsineContext {
  currentUsineId: number | null;
  defaultUsineId: number | null;
  isSiegeUser: boolean;
  accessibleUsines: AccessibleUsine[];
  isConsolidated: boolean;
}

/**
 * Signal store for site context.
 * Kept under legacy class name for backward compatibility in the codebase.
 */
@Injectable({ providedIn: 'root' })
export class UsineContextService {
  private readonly _currentUsineId = signal<number | null>(null);
  private readonly _defaultUsineId = signal<number | null>(null);
  private readonly _isSiegeUser = signal<boolean>(false);
  private readonly _accessibleUsines = signal<AccessibleUsine[]>([]);
  private readonly _isConsolidated = signal<boolean>(false);

  readonly currentUsineId = this._currentUsineId.asReadonly();
  readonly defaultUsineId = this._defaultUsineId.asReadonly();
  readonly isSiegeUser = this._isSiegeUser.asReadonly();
  readonly accessibleUsines = this._accessibleUsines.asReadonly();
  readonly isConsolidated = this._isConsolidated.asReadonly();

  readonly currentUsine = computed<AccessibleUsine | null>(() => {
    const id = this._currentUsineId();
    if (id === null) return null;
    return this._accessibleUsines().find((site) => site.id === id) ?? null;
  });

  /**
   * Header value to send on API requests.
   * - number: one selected site
   * - 'all': consolidated HQ view
   * - null: not ready yet (before /auth/me hydration)
   */
  readonly headerUsineId = computed<number | 'all' | null>(() => {
    if (this._isConsolidated()) {
      return this._isSiegeUser() ? 'all' : null;
    }

    return this._currentUsineId();
  });

  constructor() {
    this.restoreFromStorage();
  }

  hydrateFromMe(me: MeResponse): void {
    const accessibleSites = me.accessible_sites ?? me.accessible_usines ?? [];
    const defaultSiteId = me.default_site_id ?? me.default_usine_id ?? null;
    const currentSiteId = me.current_site_id ?? me.current_usine_id ?? defaultSiteId;

    this._isSiegeUser.set(!!me.is_siege_user);
    this._accessibleUsines.set(accessibleSites);
    this._defaultUsineId.set(defaultSiteId);

    const knownSiteIds = new Set(accessibleSites.map((site) => site.id));
    const resolvedCurrent =
      currentSiteId !== null && knownSiteIds.has(currentSiteId)
        ? currentSiteId
        : defaultSiteId !== null && knownSiteIds.has(defaultSiteId)
          ? defaultSiteId
          : accessibleSites[0]?.id ?? null;

    this._currentUsineId.set(resolvedCurrent);
    this._isConsolidated.set(!!me.is_siege_user && resolvedCurrent === null);

    this.persist();
  }

  switchUsine(usineId: number): void {
    const siteExists = this._accessibleUsines().some((site) => site.id === usineId);
    if (!siteExists) return;

    this._currentUsineId.set(usineId);
    this._isConsolidated.set(false);
    this.persist();
  }

  enableConsolidatedView(): void {
    if (!this._isSiegeUser()) return;
    this._currentUsineId.set(null);
    this._isConsolidated.set(true);
    this.persist();
  }

  fallbackToDefault(): void {
    const defaultId = this._defaultUsineId();

    if (defaultId !== null) {
      this.switchUsine(defaultId);
      return;
    }

    if (this._isSiegeUser()) {
      this.enableConsolidatedView();
      return;
    }

    const first = this._accessibleUsines()[0];
    if (first) {
      this.switchUsine(first.id);
    }
  }

  clear(): void {
    this._currentUsineId.set(null);
    this._defaultUsineId.set(null);
    this._isSiegeUser.set(false);
    this._accessibleUsines.set([]);
    this._isConsolidated.set(false);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  private persist(): void {
    const ctx: PersistedUsineContext = {
      currentUsineId: this._currentUsineId(),
      defaultUsineId: this._defaultUsineId(),
      isSiegeUser: this._isSiegeUser(),
      accessibleUsines: this._accessibleUsines(),
      isConsolidated: this._isConsolidated(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
  }

  private restoreFromStorage(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return;

      const ctx = JSON.parse(raw) as PersistedUsineContext;
      this._currentUsineId.set(ctx.currentUsineId ?? null);
      this._defaultUsineId.set(ctx.defaultUsineId ?? null);
      this._isSiegeUser.set(ctx.isSiegeUser ?? false);
      this._accessibleUsines.set(Array.isArray(ctx.accessibleUsines) ? ctx.accessibleUsines : []);
      this._isConsolidated.set(!!ctx.isConsolidated && !!ctx.isSiegeUser);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }
}
