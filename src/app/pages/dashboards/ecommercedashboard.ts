import { Component } from '@angular/core';
import { StatsWidget } from '@/app/pages/dashboards/ecommerce/statswidget';
import { RecentSalesWidget } from '@/app/pages/dashboards/ecommerce/recentsaleswidget';
import { RevenueOverViewWidget } from '@/app/pages/dashboards/ecommerce/revenueoverviewwidget';
import { SalesByCategoryWidget } from '@/app/pages/dashboards/ecommerce/salesbycategorywidget';
import { TopProductsWidget } from '@/app/pages/dashboards/ecommerce/topproductswidget';

@Component({
    selector: 'app-ecommerce-dashboard',
    standalone: true,
    imports: [StatsWidget, RecentSalesWidget, RevenueOverViewWidget, SalesByCategoryWidget, TopProductsWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget />
            <div class="col-span-12 xl:col-span-9">
                <app-revenue-overview-widget />
            </div>
            <div class="col-span-12 xl:col-span-3">
                <app-sales-by-category-widget />
            </div>
            <div class="col-span-12 lg:col-span-7">
                <app-recent-sales-widget />
            </div>
            <div class="col-span-12 lg:col-span-5">
                <app-top-products-widget />
            </div>
        </div>
    `
})
export class EcommerceDashboard {}
