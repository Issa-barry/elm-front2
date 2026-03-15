import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehiculeService } from '@/services/vehicules/vehicule.service';
import { Vehicule } from '@/models/vehicule.model';
import { RouterModule } from '@angular/router';
import { VehiculeForm } from '../vehicule-form/vehicule-form';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-vehicule-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, VehiculeForm, SkeletonModule],
  templateUrl: './vehicule-edit.html',
  styleUrl: './vehicule-edit.scss',
})
export class VehiculeEdit implements OnInit {
  vehicule = signal<Vehicule | null>(null);
  loading = signal(true);
  notFound = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehiculeService: VehiculeService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/vehicules']);
      return;
    }

    this.vehiculeService.getOne(id).subscribe({
      next: (resp) => {
        this.vehicule.set(resp.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }
}
