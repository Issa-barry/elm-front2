import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-vente-form',
 standalone: true,
    imports: [CommonModule, ButtonModule, StyleClassModule],
       templateUrl: './vente-form.html',
  styleUrl: './vente-form.scss',
})
export class VenteForm { 
}
 