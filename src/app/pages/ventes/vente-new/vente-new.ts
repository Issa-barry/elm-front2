import { Component } from '@angular/core';
import { VenteForm } from '../vente-form/vente-form';

@Component({
  selector: 'app-vente-new',
  standalone: true,
  imports: [VenteForm],
  templateUrl: './vente-new.html',
  styleUrl: './vente-new.scss',
})
export class VenteNew {

}
