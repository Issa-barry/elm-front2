import { Injectable, signal } from '@angular/core';

export type MenuMode = 'static' | 'overlay' | 'slim' | 'slim-plus' | 'horizontal' | 'reveal' | 'drawer' | string;
export type MenuTheme = 'colorScheme' | 'primaryColor' | 'transparent' | string;

export interface AppLayoutConfig {
    preset: string;
    primary: string;
    surface: string;
    colorScheme: 'light' | 'dark' | 'dim' | string;
    darkTheme: boolean;
    menuMode: MenuMode;
    menuTheme: MenuTheme;
}

export interface AppLayoutState {
    staticMenuInactive: boolean;
    staticMenuMobileActive: boolean;
    overlayMenuActive: boolean;
    mobileMenuActive: boolean;
    menuHoverActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    activePath: string | null;
    sidebarExpanded: boolean;
    anchored: boolean;
}

const DESKTOP_BREAKPOINT = 991;

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    readonly layoutConfig = signal<AppLayoutConfig>({
        preset: 'Aura',
        primary: 'blue',
        surface: 'slate',
        colorScheme: 'light',
        darkTheme: false,
        menuMode: 'static',
        menuTheme: 'colorScheme'
    });

    readonly layoutState = signal<AppLayoutState>({
        staticMenuInactive: false,
        staticMenuMobileActive: false,
        overlayMenuActive: false,
        mobileMenuActive: false,
        menuHoverActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        activePath: null,
        sidebarExpanded: false,
        anchored: false
    });

    toggleMenu(): void {
        if (this.isDesktop()) {
            if (this.isOverlay() || this.isDrawer() || this.isReveal()) {
                this.layoutState.update((state) => ({
                    ...state,
                    overlayMenuActive: !state.overlayMenuActive,
                    mobileMenuActive: false,
                    staticMenuMobileActive: false
                }));
                return;
            }

            this.layoutState.update((state) => ({
                ...state,
                staticMenuInactive: !state.staticMenuInactive
            }));
            return;
        }

        this.layoutState.update((state) => {
            const next = !state.mobileMenuActive;
            return {
                ...state,
                mobileMenuActive: next,
                staticMenuMobileActive: next,
                overlayMenuActive: false
            };
        });
    }

    toggleProfileSidebar(): void {
        this.layoutState.update((state) => ({
            ...state,
            profileSidebarVisible: !state.profileSidebarVisible
        }));
    }

    toggleConfigSidebar(): void {
        this.layoutState.update((state) => ({
            ...state,
            configSidebarVisible: !state.configSidebarVisible
        }));
    }

    hasOpenOverlay(): boolean {
        const state = this.layoutState();
        return state.overlayMenuActive || state.mobileMenuActive;
    }

    hasOverlaySubmenu(): boolean {
        const mode = this.layoutConfig().menuMode;
        return mode === 'horizontal' || mode === 'slim' || mode === 'slim-plus';
    }

    hasOpenOverlaySubmenu(): boolean {
        if (!this.hasOverlaySubmenu()) return false;
        const state = this.layoutState();
        return !!state.activePath || state.menuHoverActive;
    }

    isSlim(): boolean {
        return this.layoutConfig().menuMode === 'slim';
    }

    isSlimPlus(): boolean {
        return this.layoutConfig().menuMode === 'slim-plus';
    }

    isHorizontal(): boolean {
        return this.layoutConfig().menuMode === 'horizontal';
    }

    isOverlay(): boolean {
        return this.layoutConfig().menuMode === 'overlay';
    }

    isDrawer(): boolean {
        return this.layoutConfig().menuMode === 'drawer';
    }

    isReveal(): boolean {
        return this.layoutConfig().menuMode === 'reveal';
    }

    isDarkTheme(): boolean {
        return this.layoutConfig().darkTheme;
    }

    isDesktop(): boolean {
        return typeof window !== 'undefined' ? window.innerWidth > DESKTOP_BREAKPOINT : true;
    }
}
