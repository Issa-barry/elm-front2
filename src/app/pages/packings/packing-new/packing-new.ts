import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { CreatePackingDto } from '@/models/packing.model';
import { Prestataire } from '@/models/prestataire.model';
import { PackingService } from '@/services/packing/packing.service';
import { ApiResponse as PrestataireApiResponse, PaginatedResponse as PrestatairePaginatedResponse, PrestataireService } from '@/services/prestataire/prestataire.service';
import { PackingForm } from '../packing-form/packing-form';

@Component({
  selector: 'app-packing-new',
  standalone: true,
  imports: [CommonModule, ToastModule, PackingForm],
  providers: [MessageService],
  templateUrl: './packing-new.html',
  styleUrl: './packing-new.scss',
})
export class PackingNew implements OnInit {
  prestataires: Prestataire[] = [];
  loadingPrestataires = false;
  loadingPrixRouleau = false;
  saving = false;
  defaultPrixRouleau = 0;

  constructor(
    private packingService: PackingService,
    private prestataireService: PrestataireService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPrestataires();
    this.loadPrixRouleauDefaut();
  }

  onSubmit(payload: CreatePackingDto): void {
    if (this.saving) return;
    this.saving = true;

    this.packingService.createPacking(payload).subscribe({
      next: (response) => {
        const packingId = response.data?.id;
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: 'Packing cree.',
          life: 2000,
        });

        this.saving = false;

        if (packingId) {
          this.router.navigate(['/packings/edit', packingId]);
          return;
        }

        this.router.navigate(['/packings']);
      },
      error: (error) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.getApiErrorDetail(error, 'Impossible de creer le packing.'),
          life: 5000,
        });
      },
    });
  }

  onCancel(): void {
    if (this.saving) return;
    this.router.navigate(['/packings']);
  }

  private loadPrixRouleauDefaut(): void {
    this.loadingPrixRouleau = true;
    this.packingService.getPrixRouleauDefaut().subscribe({
      next: (prix: number) => {
        this.defaultPrixRouleau = prix;
        this.loadingPrixRouleau = false;
      },
      error: () => {
        this.loadingPrixRouleau = false;
      },
    });
  }

  private loadPrestataires(): void {
    this.loadingPrestataires = true;
    this.prestataireService.getPrestataires({ is_active: true, per_page: 300 }).subscribe({
      next: (response) => {
        const list = this.extractPrestataires(response)
          .slice()
          .sort((a, b) => (a.nom_complet || '').localeCompare(b.nom_complet || ''));
        this.prestataires = list;
        this.loadingPrestataires = false;
      },
      error: (error) => {
        this.loadingPrestataires = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.getApiErrorDetail(error, 'Impossible de charger les prestataires.'),
          life: 5000,
        });
      },
    });
  }

  private extractPrestataires(
    response: PrestataireApiResponse<Prestataire[]> | PrestatairePaginatedResponse<Prestataire>,
  ): Prestataire[] {
    const data = response.data;
    return Array.isArray(data) ? data : (data.data ?? []);
  }

  private getApiErrorDetail(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: unknown } })?.error?.message;
    if (typeof message === 'string' && message.trim().length > 0) return message.trim();
    return fallback;
  }
}
