import { Component } from '@angular/core';
import { LivreurForm } from '../livreur-form/livreur-form';

@Component({
  selector: 'app-livreur-new',
  standalone: true,
  imports: [LivreurForm],
  templateUrl: './livreur-new.html',
  styleUrl: './livreur-new.scss',
})
export class LivreurNew {}
