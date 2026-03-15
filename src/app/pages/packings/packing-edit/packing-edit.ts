import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { CreatePackingDto, Packing } from '@/models/packing.model';
import { Prestataire } from '@/models/prestataire.model';
import { PackingService } from '@/services/packing/packing.service';
import { ApiResponse as PrestataireApiResponse, PaginatedResponse as PrestatairePaginatedResponse, PrestataireService } from '@/services/prestataire/prestataire.service';
import { PackingForm } from '../packing-form/packing-form';

@Component({
  selector: 'app-packing-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule, PackingForm],
  providers: [MessageService],
  templateUrl: './packing-edit.html',
  styleUrl: './packing-edit.scss',
})
export class PackingEdit implements OnInit {
  packing: Packing | null = null;
  prestataires: Prestataire[] = [];
  loadingPage = true;
  loadingPrestataires = false;
  saving = false;
  notFound = false;
  private packingId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packingService: PackingService,
    private prestataireService: PrestataireService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/packings']);
      return;
    }

    this.packingId = id;
    this.loadPacking(id);
    this.loadPrestataires();
  }

  onSubmit(payload: CreatePackingDto): void {
    if (!this.packingId || this.saving) return;
    this.saving = true;

    this.packingService.updatePacking(this.packingId, payload).subscribe({
      next: (response) => {
        this.packing = response.data;
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: 'Packing mis a jour.',
          life: 3000,
        });
      },
      error: (error) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.getApiErrorDetail(error, 'Impossible de mettre a jour le packing.'),
          life: 5000,
        });
      },
    });
  }

  onCancel(): void {
    if (this.saving) return;
    this.router.navigate(['/packings']);
  }

  private loadPacking(id: number): void {
    this.loadingPage = true;
    this.packingService.getPacking(id).subscribe({
      next: (response) => {
        this.packing = response.data;
        this.loadingPage = false;
      },
      error: () => {
        this.loadingPage = false;
        this.notFound = true;
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
