import { Component } from '@angular/core';
import { VehiculeForm } from '../vehicule-form/vehicule-form';

@Component({
  selector: 'app-vehicule-new',
  standalone: true,
  imports: [VehiculeForm],
  templateUrl: './vehicule-new.html',
  styleUrl: './vehicule-new.scss',
})
export class VehiculeNew {}
