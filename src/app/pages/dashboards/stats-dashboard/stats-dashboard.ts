import { Component } from '@angular/core';
import { StatsWidget } from '../ecommerce/statswidget';
import { RecentSalesWidget } from '../ecommerce/recentsaleswidget';
import { StatsPackingWidget } from '../ecommerce/stats-packing-widget';
import { TopProductsWidget } from '../ecommerce/topproductswidget';
import { VehiculesCategorieWidget } from '@/app/pages/dashboards/ecommerce/vehicules-categorie-widget';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [StatsWidget, RecentSalesWidget, StatsPackingWidget, VehiculesCategorieWidget, TopProductsWidget],
  templateUrl: './stats-dashboard.html',
  styleUrl: './stats-dashboard.scss',
})
export class StatsDashboard {

}
