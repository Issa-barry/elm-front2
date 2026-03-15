import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';

import { Proprietaire } from '@/models/vehicule.model';
import { ProprietaireService } from '@/services/proprietaires/proprietaire.service';
import { ProprietaireForm } from '../proprietaire-form/proprietaire-form';

@Component({
  selector: 'app-proprietaire-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ProprietaireForm, SkeletonModule],
  templateUrl: './proprietaire-edit.html',
  styleUrl: './proprietaire-edit.scss',
})
export class ProprietaireEdit implements OnInit {
  proprietaire = signal<Proprietaire | null>(null);
  loading = signal(true);
  notFound = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proprietaireService: ProprietaireService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/vehicules/proprietaires']);
      return;
    }

    this.proprietaireService.getOne(id).subscribe({
      next: (resp) => {
        this.proprietaire.set(resp.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }
}
