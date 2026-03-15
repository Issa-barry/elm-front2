import { Injectable } from '@angular/core';
import { Prestataire } from '@/models/prestataire.model';

interface PrestataireCachePayload {
  savedAt: number;
  data: Prestataire[];
}

@Injectable({ providedIn: 'root' })
export class PrestataireOfflineCacheService {
  private readonly storagePrefix = 'prestataires_cache_v1';
  private readonly isBrowser = typeof window !== 'undefined';

  getPrestataires(usineId: number | null = null): Prestataire[] {
    if (!this.isBrowser) return [];

    try {
      const raw = localStorage.getItem(this.buildKey(usineId));
      if (!raw) return [];

      const payload = JSON.parse(raw) as Partial<PrestataireCachePayload>;
      if (!Array.isArray(payload.data)) return [];
      return payload.data;
    } catch {
      return [];
    }
  }

  savePrestataires(prestataires: Prestataire[], usineId: number | null = null): void {
    if (!this.isBrowser || !Array.isArray(prestataires)) return;

    const payload: PrestataireCachePayload = {
      savedAt: Date.now(),
      data: prestataires
    };

    try {
      localStorage.setItem(this.buildKey(usineId), JSON.stringify(payload));
    } catch {
      // Ignore quota/storage errors.
    }
  }

  getLastSyncAt(usineId: number | null = null): number | null {
    if (!this.isBrowser) return null;

    try {
      const raw = localStorage.getItem(this.buildKey(usineId));
      if (!raw) return null;

      const payload = JSON.parse(raw) as Partial<PrestataireCachePayload>;
      return typeof payload.savedAt === 'number' ? payload.savedAt : null;
    } catch {
      return null;
    }
  }

  clear(usineId: number | null = null): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(this.buildKey(usineId));
    } catch {
      // Ignore storage errors.
    }
  }

  private buildKey(usineId: number | null): string {
    return `${this.storagePrefix}:${usineId ?? 'all'}`;
  }
}

