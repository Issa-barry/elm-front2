import { Component } from '@angular/core';
import { StatsWidget } from '@/app/pages/dashboards/ecommerce/statswidget';
import { RecentSalesWidget } from '@/app/pages/dashboards/ecommerce/recentsaleswidget';
import { RevenueOverViewWidget } from '@/app/pages/dashboards/ecommerce/revenueoverviewwidget';
import { SalesByCategoryWidget } from '@/app/pages/dashboards/ecommerce/salesbycategorywidget';
import { TopProductsWidget } from '@/app/pages/dashboards/ecommerce/topproductswidget';
 

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
     imports: [StatsWidget, RecentSalesWidget, RevenueOverViewWidget, SalesByCategoryWidget, TopProductsWidget],
  templateUrl: './stats-dashboard.html',
  styleUrl: './stats-dashboard.scss',
})
export class StatsDashboard {

}
