import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AppConfigurator } from '@/app/layout/components/app.configurator';
import { AuthService } from '@/services/auth/auth.service';
import { COUNTRIES, Country } from '@/models/country.model';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AppConfigurator,
        ButtonModule,
        SelectModule,
        MessageModule,
    ],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login implements OnInit {
    private fb          = inject(FormBuilder);
    private authService = inject(AuthService);
    private router      = inject(Router);

    private readonly isBrowser         = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    private readonly COUNTRY_STORAGE_KEY = 'login_country_code';

    LayoutService = inject(LayoutService);
    isDarkTheme   = computed(() => this.LayoutService.isDarkTheme());

    // État
    isLoading     = signal(false);
    showPassword  = signal(false);
    errorMessage  = signal<string | null>(null);
    fieldErrors   = signal<Record<string, string[]>>({});

    // Pays
    countries       : Country[] = COUNTRIES;
    selectedCountry : Country   = COUNTRIES[0];

    // Formulaire réactif
    loginForm: FormGroup = this.fb.group({
        phone    : ['', [Validators.required]],
        password : ['', [Validators.required, Validators.minLength(6)]],
        remember_me: [false],
    });

    ngOnInit(): void {
        if (!this.isBrowser) return;
        const saved = localStorage.getItem(this.COUNTRY_STORAGE_KEY);
        if (saved) {
            const found = COUNTRIES.find(c => c.code === saved);
            if (found) this.selectedCountry = found;
        }
    }

    onCountryChange(): void {
        if (this.isBrowser) {
            localStorage.setItem(this.COUNTRY_STORAGE_KEY, this.selectedCountry.code);
        }
    }

    onSubmit(): void {
        this.errorMessage.set(null);
        this.fieldErrors.set({});

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);

        this.authService.login({
            phone          : this.loginForm.value.phone,
            code_phone_pays: this.selectedCountry.dialCode,
            password       : this.loginForm.value.password,
            remember_me    : this.loginForm.value.remember_me,
        }).subscribe({
            next: () => {
                this.isLoading.set(false);
                const returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/';
                this.router.navigate([returnUrl]);
            },
            error: (error) => {
                this.isLoading.set(false);
                if (error.status === 422 && error.error?.errors) {
                    this.fieldErrors.set(error.error.errors);
                } else if (error.error?.message) {
                    this.errorMessage.set(error.error.message);
                } else {
                    this.errorMessage.set('Une erreur est survenue lors de la connexion');
                }
            },
        });
    }

    getFieldError(field: string): string | null {
        const errors = this.fieldErrors();
        return errors[field]?.[0] ?? null;
    }

    isFieldInvalid(field: string): boolean {
        const f = this.loginForm.get(field);
        return !!(f && f.invalid && (f.dirty || f.touched));
    }
}
