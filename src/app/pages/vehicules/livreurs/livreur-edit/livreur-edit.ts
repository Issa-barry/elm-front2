import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';

import { Livreur } from '@/models/vehicule.model';
import { LivreurService } from '@/services/livreurs/livreur.service';
import { LivreurForm } from '../livreur-form/livreur-form';

@Component({
  selector: 'app-livreur-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, LivreurForm, SkeletonModule],
  templateUrl: './livreur-edit.html',
  styleUrl: './livreur-edit.scss',
})
export class LivreurEdit implements OnInit {
  livreur = signal<Livreur | null>(null);
  loading = signal(true);
  notFound = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private livreurService: LivreurService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/vehicules/livreurs']);
      return;
    }

    this.livreurService.getOne(id).subscribe({
      next: (resp) => {
        this.livreur.set(resp.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }
}
