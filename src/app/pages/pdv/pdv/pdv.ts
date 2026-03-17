import { Component } from '@angular/core';
import { PdvForm } from '../pdv-form/pdv-form';

@Component({
  selector: 'app-pdv',
  standalone:true,
  imports: [PdvForm],
  templateUrl: './pdv.html',
  styleUrl: './pdv.scss',
})
export class Pdv {

}
