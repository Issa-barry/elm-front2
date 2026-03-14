import { Injectable } from '@angular/core';

const VERSION_URL = 'version.json';
const STORAGE_KEY = 'app_deploy_version';
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Vérifie périodiquement si une nouvelle version a été déployée et force le rechargement.
 */
@Injectable({ providedIn: 'root' })
export class DeployVersionService {
    private intervalId: ReturnType<typeof setInterval> | null = null;

    constructor() {
        this.init();
    }

    private init(): void {
        this.checkOnce().then((version) => {
            if (version != null) {
                try {
                    sessionStorage.setItem(STORAGE_KEY, String(version.build));
                } catch {}
            }
        });

        this.intervalId = setInterval(() => this.checkAndReload(), CHECK_INTERVAL_MS);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkAndReload();
            }
        });
    }

    private getCachedVersion(): number | null {
        try {
            const v = sessionStorage.getItem(STORAGE_KEY);
            return v != null ? Number(v) : null;
        } catch {
            return null;
        }
    }

    private async checkOnce(): Promise<{ build: number } | null> {
        try {
            const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { Pragma: 'no-cache' }
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data && typeof data.build === 'number' ? data : null;
        } catch {
            return null;
        }
    }

    private async checkAndReload(): Promise<void> {
        const current = this.getCachedVersion();
        const latest = await this.checkOnce();
        if (latest == null) return;
        if (current != null && latest.build !== current) {
            clearInterval(this.intervalId!);
            window.location.reload();
        }
    }
}
