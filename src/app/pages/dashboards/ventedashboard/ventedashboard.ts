import { Component } from '@angular/core';
import { ProductService } from '@/app/pages//service/product.service';
import { Statsventewidget } from '../widgets/statsventewidget/statsventewidget';
import { HeaderWidget } from '../banking/headerwidget';
import { StatsBankingWidget } from '../banking/statsbankingwidget';
import { RecentTransactionsWidget } from '../banking/recenttransactionswidget';
import { OverviewWidget } from '../banking/overviewwidget';
import { RecentTransactionsTwoWidget } from '../banking/recenttransactionstwowidget';
import { MonthlyPaymentsWidget } from '../banking/monthlypaymentswidget';
import { SoldeCardWidget } from '../widgets/solde-card-widget/solde-card-widget';

@Component({
  selector: 'app-ventedashboard',
  standalone: true,
  imports: [
            HeaderWidget, 
            RecentTransactionsWidget, 
            OverviewWidget, 
            RecentTransactionsTwoWidget, 
            MonthlyPaymentsWidget,
            SoldeCardWidget,
          ],
  providers: [ProductService],
  templateUrl: './ventedashboard.html',
  styleUrl: './ventedashboard.scss',
  host: {
    '[style.display]': '"contents"'
  }
})
export class Ventedashboard {
  

}
