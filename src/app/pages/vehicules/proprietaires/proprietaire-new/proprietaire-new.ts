import { Component } from '@angular/core';
import { ProprietaireForm } from '../proprietaire-form/proprietaire-form';

@Component({
  selector: 'app-proprietaire-new',
  standalone: true,
  imports: [ProprietaireForm],
  templateUrl: './proprietaire-new.html',
  styleUrl: './proprietaire-new.scss',
})
export class ProprietaireNew {}
