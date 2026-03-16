import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AppTopbar } from './app.topbar';
import { AppSidebar } from './app.sidebar';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AppConfigurator } from './app.configurator';
import { AppProfileSidebar } from './app.profilesidebar';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, AppTopbar, AppSidebar, RouterModule, AppConfigurator, AppProfileSidebar],
    template: `<div class="layout-container" [ngClass]="containerClass()">
        @if (showTopbar()) {
            <div app-sidebar></div>
        }
        <div class="layout-content-wrapper" [class.mobile-fullscreen]="!showTopbar()">
            @if (showTopbar()) {
                <div app-topbar></div>
            }
            <div class="layout-content" [class.mobile-fullscreen-content]="!showTopbar()">
                <router-outlet></router-outlet>
            </div>
        </div>
        <div app-profilesidebar></div>
        <app-configurator></app-configurator>
        <div class="layout-mask"></div>
    </div> `
})
export class AppLayout {
    layoutService = inject(LayoutService);
    private router = inject(Router);

    private isMobile = signal(typeof window !== 'undefined' && window.innerWidth <= 768);
    private isHome = signal(true);

    showTopbar = computed(() => !this.isMobile() || this.isHome());

    @HostListener('window:resize')
    onResize() {
        this.isMobile.set(window.innerWidth <= 768);
    }

    constructor() {
        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
            this.isHome.set(e.urlAfterRedirects === '/' || e.urlAfterRedirects === '');
        });

        effect(() => {
            const state = this.layoutService.layoutState();
            if (state.mobileMenuActive) {
                document.body.classList.add('blocked-scroll');
            } else {
                document.body.classList.remove('blocked-scroll');
            }
        });
    }

    containerClass = computed(() => {
        const layoutConfig = this.layoutService.layoutConfig();
        const layoutState = this.layoutService.layoutState();

        return {
            'layout-light': !layoutConfig.darkTheme,
            'layout-dark': layoutConfig.darkTheme,
            'layout-colorscheme-menu': layoutConfig.menuTheme === 'colorScheme',
            'layout-primarycolor-menu': layoutConfig.menuTheme === 'primaryColor',
            'layout-transparent-menu': layoutConfig.menuTheme === 'transparent',
            'layout-overlay': layoutConfig.menuMode === 'overlay',
            'layout-static': layoutConfig.menuMode === 'static',
            'layout-slim': layoutConfig.menuMode === 'slim',
            'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
            'layout-horizontal': layoutConfig.menuMode === 'horizontal',
            'layout-reveal': layoutConfig.menuMode === 'reveal',
            'layout-drawer': layoutConfig.menuMode === 'drawer',
            'layout-static-inactive': layoutState.staticMenuInactive && layoutConfig.menuMode === 'static',
            'layout-overlay-active': layoutState.overlayMenuActive,
            'layout-mobile-active': layoutState.mobileMenuActive,
            'layout-sidebar-expanded': layoutState.sidebarExpanded,
            'layout-sidebar-anchored': layoutState.anchored
        };
    });
}
